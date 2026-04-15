/**
 * ============================================
 * SalonFlow — Review Model
 * ============================================
 * Customer reviews for staff members,
 * linked to completed appointments.
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true, // One review per appointment
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── After save: Update staff rating ──────────────────────────
reviewSchema.post('save', async function () {
  const Staff = mongoose.model('Staff');
  const reviews = await this.constructor.find({ staff: this.staff });
  
  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

  await Staff.findByIdAndUpdate(this.staff, {
    'rating.average': parseFloat(avgRating),
    'rating.count': reviews.length,
  });
});

// ─── Index ────────────────────────────────────────────────────
reviewSchema.index({ staff: 1 });
reviewSchema.index({ customer: 1 });

module.exports = mongoose.model('Review', reviewSchema);
