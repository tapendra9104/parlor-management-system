/**
 * ============================================
 * SalonFlow — Service Model
 * ============================================
 * Defines salon services with categories,
 * pricing, duration, and active status.
 */

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
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
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    popularity: {
      type: Number,
      default: 0, // Tracks how many times this service has been booked
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for filtering ──────────────────────────────────────
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ popularity: -1 });

module.exports = mongoose.model('Service', serviceSchema);
