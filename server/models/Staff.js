/**
 * ============================================
 * SalonFlow — Staff Model
 * ============================================
 * Links to User model for staff-specific data:
 * specializations, weekly availability schedule,
 * and performance metrics.
 */

const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String, // Format: "09:00"
      required: true,
    },
    endTime: {
      type: String, // Format: "18:00"
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const staffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specializations: [
      {
        type: String,
        enum: [
          'Haircut',
          'Hair Color',
          'Hair Treatment',
          'Facial',
          'Skin Care',
          'Manicure',
          'Pedicure',
          'Makeup',
          'Waxing',
          'Massage',
          'Bridal',
          'Other',
        ],
      },
    ],
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    experience: {
      type: Number, // Years of experience
      default: 0,
      min: 0,
    },
    availability: {
      type: [availabilitySchema],
      default: [
        { day: 'Monday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '18:00', isAvailable: true },
        { day: 'Saturday', startTime: '10:00', endTime: '16:00', isAvailable: true },
        { day: 'Sunday', startTime: '00:00', endTime: '00:00', isAvailable: false },
      ],
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    completedAppointments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: Populate user data ──────────────────────────────
staffSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// ─── Index ────────────────────────────────────────────────────
staffSchema.index({ isAvailable: 1 });
staffSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('Staff', staffSchema);
