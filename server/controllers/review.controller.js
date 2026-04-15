/**
 * SalonFlow — Review Controller
 */
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');

const createReview = async (req, res, next) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (appointment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed appointments' });
    }

    const existing = await Review.findOne({ appointment: appointmentId });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed' });

    const review = await Review.create({
      customer: req.user._id,
      staff: appointment.staff,
      appointment: appointmentId,
      rating,
      comment,
    });

    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  } catch (error) { next(error); }
};

const getStaffReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ staff: req.params.staffId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) { next(error); }
};

module.exports = { createReview, getStaffReviews };
