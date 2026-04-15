/**
 * ============================================
 * SalonFlow — Appointment Controller
 * ============================================
 */

const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendBookingConfirmation, sendBookingCancellation } = require('../services/emailService');

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Customer
const createAppointment = async (req, res, next) => {
  try {
    const { staff, services, date, timeSlot, notes, bookedVia } = req.body;

    // Calculate total duration and amount
    const serviceDetails = await Service.find({ _id: { $in: services } });
    if (serviceDetails.length !== services.length) {
      return res.status(400).json({ success: false, message: 'One or more services not found' });
    }

    const totalDuration = serviceDetails.reduce((sum, s) => sum + s.duration, 0);
    const totalAmount = serviceDetails.reduce((sum, s) => sum + s.price, 0);

    // Calculate end time
    const [startHour, startMin] = timeSlot.start.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMin + totalDuration;
    const endTime = `${Math.floor(totalMinutes / 60).toString().padStart(2, '0')}:${(totalMinutes % 60).toString().padStart(2, '0')}`;

    // Check for conflicts
    const hasConflict = await Appointment.hasConflict(staff, date, timeSlot.start, endTime);
    if (hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another slot.',
      });
    }

    const appointment = await Appointment.create({
      customer: req.user._id,
      staff,
      services,
      date,
      timeSlot: { start: timeSlot.start, end: endTime },
      totalDuration,
      totalAmount,
      notes,
      bookedVia: bookedVia || 'web',
    });

    // Populate for response
    await appointment.populate([
      { path: 'services', select: 'name duration price' },
      { path: 'staff', populate: { path: 'userId', select: 'name' } },
    ]);

    // Update service popularity
    await Service.updateMany(
      { _id: { $in: services } },
      { $inc: { popularity: 1 } }
    );

    // Create notification for staff
    const staffDoc = await Staff.findById(staff).populate('userId', 'name');
    const io = req.app.get('io');
    
    const notification = await Notification.create({
      user: staffDoc.userId._id,
      type: 'booking_confirmed',
      title: 'New Appointment',
      message: `New appointment booked by ${req.user.name} on ${new Date(date).toLocaleDateString()}`,
      link: '/staff/appointments',
    });

    if (io) {
      io.to(`user_${staffDoc.userId._id}`).emit('notification', notification);
    }

    // Send confirmation email to customer
    sendBookingConfirmation(req.user, appointment, serviceDetails).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments (filtered by role)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
    } else if (req.user.role === 'staff') {
      const staffProfile = await Staff.findOne({ userId: req.user._id });
      if (staffProfile) query.staff = staffProfile._id;
    }

    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const appointments = await Appointment.find(query)
      .populate('customer', 'name email phone')
      .populate('services', 'name duration price category')
      .populate({ path: 'staff', populate: { path: 'userId', select: 'name avatar' } })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        appointments,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Admin/Staff
const updateStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;
    
    if (status === 'completed') {
      await Staff.findByIdAndUpdate(appointment.staff, { $inc: { completedAppointments: 1 } });
    }

    await appointment.save();

    // Notify customer
    const io = req.app.get('io');
    const notification = await Notification.create({
      user: appointment.customer,
      type: status === 'cancelled' ? 'booking_cancelled' : 'booking_confirmed',
      title: `Appointment ${status}`,
      message: `Your appointment has been ${status}.`,
      link: '/bookings',
    });

    if (io) {
      io.to(`user_${appointment.customer}`).emit('notification', notification);
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Customer (own) / Admin
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only owner or admin can cancel
    if (req.user.role === 'customer' && appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${appointment.status} appointment` });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || 'Cancelled by user';
    await appointment.save();

    // Send cancellation email
    const customer = await User.findById(appointment.customer);
    if (customer) {
      sendBookingCancellation(customer, appointment).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots
// @route   GET /api/appointments/slots
// @access  Public
const getAvailableSlots = async (req, res, next) => {
  try {
    const { staffId, date, duration = 60 } = req.query;

    if (!staffId || !date) {
      return res.status(400).json({ success: false, message: 'Staff ID and date are required' });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedule = staff.availability.find((a) => a.day === dayName);

    if (!daySchedule || !daySchedule.isAvailable) {
      return res.status(200).json({
        success: true,
        data: { available: false, slots: [], message: `Not available on ${dayName}` },
      });
    }

    // Get booked appointments for this date
    const dayStart = new Date(requestedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      staff: staffId,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: ['cancelled', 'no-show'] },
    });

    // Generate slots
    const slots = [];
    const [startH, startM] = daySchedule.startTime.split(':').map(Number);
    const [endH, endM] = daySchedule.endTime.split(':').map(Number);
    const totalDuration = parseInt(duration);

    let current = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (current + totalDuration <= endMinutes) {
      const slotStart = `${Math.floor(current / 60).toString().padStart(2, '0')}:${(current % 60).toString().padStart(2, '0')}`;
      const slotEnd = `${Math.floor((current + totalDuration) / 60).toString().padStart(2, '0')}:${((current + totalDuration) % 60).toString().padStart(2, '0')}`;

      // Check for conflicts
      const isBooked = bookedAppointments.some((apt) => {
        return apt.timeSlot.start < slotEnd && apt.timeSlot.end > slotStart;
      });

      slots.push({
        start: slotStart,
        end: slotEnd,
        available: !isBooked,
      });

      current += 30; // 30-minute intervals
    }

    res.status(200).json({
      success: true,
      data: {
        available: true,
        date: date,
        staff: staffId,
        slots,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAppointment, getAppointments, updateStatus, cancelAppointment, getAvailableSlots };
