/**
 * ============================================
 * SalonFlow — Staff Controller
 * ============================================
 * Handles staff CRUD, availability, and profile
 * management. Includes admin staff creation.
 */

const Staff = require('../models/Staff');
const User = require('../models/User');

/**
 * @desc    Create new staff member (admin only)
 * @route   POST /api/staff
 * @access  Admin
 */
const createStaff = async (req, res, next) => {
  try {
    const { name, email, password, phone, specializations, bio, experience } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is a customer, upgrade to staff
      if (existingUser.role === 'customer') {
        existingUser.role = 'staff';
        if (phone) existingUser.phone = phone;
        await existingUser.save();

        // Check if staff profile already exists
        let staffProfile = await Staff.findOne({ userId: existingUser._id });
        if (!staffProfile) {
          staffProfile = await Staff.create({
            userId: existingUser._id,
            specializations: specializations || [],
            bio: bio || '',
            experience: experience || 0,
          });
        }

        await staffProfile.populate('userId', 'name email phone avatar');

        return res.status(201).json({
          success: true,
          message: `${name} has been upgraded from customer to staff.`,
          data: staffProfile,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Create new user with staff role
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'staff',
    });

    // Create staff profile
    const staffProfile = await Staff.create({
      userId: user._id,
      specializations: specializations || [],
      bio: bio || '',
      experience: experience || 0,
    });

    await staffProfile.populate('userId', 'name email phone avatar');

    res.status(201).json({
      success: true,
      message: `Staff member "${name}" created successfully!`,
      data: staffProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all staff
 * @route   GET /api/staff
 * @access  Public
 */
const getAllStaff = async (req, res, next) => {
  try {
    const { specialization, includeInactive } = req.query;
    const query = {};

    // By default only show available staff; admin can see all
    if (!includeInactive) {
      query.isAvailable = true;
    }
    if (specialization) {
      query.specializations = specialization;
    }

    const staff = await Staff.find(query)
      .populate('userId', 'name email phone avatar')
      .sort({ 'rating.average': -1 });

    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single staff
 * @route   GET /api/staff/:id
 * @access  Public
 */
const getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('userId', 'name email phone avatar');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update staff profile
 * @route   PUT /api/staff/:id
 * @access  Admin/Staff (own profile)
 */
const updateStaff = async (req, res, next) => {
  try {
    const { specializations, bio, experience, availability, isAvailable } = req.body;

    const updateFields = {};
    if (specializations) updateFields.specializations = specializations;
    if (bio !== undefined) updateFields.bio = bio;
    if (experience !== undefined) updateFields.experience = experience;
    if (availability) updateFields.availability = availability;
    if (isAvailable !== undefined) updateFields.isAvailable = isAvailable;

    const staff = await Staff.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email phone avatar');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Staff profile updated',
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get staff availability for a specific date
 * @route   GET /api/staff/:id/availability
 * @access  Public
 */
const getStaffAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    const staff = await Staff.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const dayAvailability = staff.availability.find((a) => a.day === dayName);

    if (!dayAvailability || !dayAvailability.isAvailable) {
      return res.status(200).json({
        success: true,
        data: { available: false, slots: [], message: `Staff is not available on ${dayName}` },
      });
    }

    // Get booked slots for this date
    const Appointment = require('../models/Appointment');
    const bookedSlots = await Appointment.find({
      staff: req.params.id,
      date: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lte: new Date(requestedDate.setHours(23, 59, 59, 999)),
      },
      status: { $nin: ['cancelled', 'no-show'] },
    }).select('timeSlot');

    res.status(200).json({
      success: true,
      data: {
        available: true,
        workingHours: {
          start: dayAvailability.startTime,
          end: dayAvailability.endTime,
        },
        bookedSlots: bookedSlots.map((s) => s.timeSlot),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete staff (admin)
 * @route   DELETE /api/staff/:id
 * @access  Admin
 */
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    // Deactivate staff and associated user
    staff.isAvailable = false;
    await staff.save();
    await User.findByIdAndUpdate(staff.userId, { role: 'customer' });

    res.status(200).json({
      success: true,
      message: 'Staff member removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createStaff, getAllStaff, getStaff, updateStaff, getStaffAvailability, deleteStaff };
