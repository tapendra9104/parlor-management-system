/**
 * ============================================
 * SalonFlow — Appointment Model
 * ============================================
 * Manages bookings with conflict detection,
 * status tracking, and payment linkage.
 * 
 * Statuses: pending → confirmed → in-progress → completed
 *           pending → cancelled
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Staff member is required'],
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
    ],
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      start: {
        type: String, // Format: "10:00"
        required: [true, 'Start time is required'],
      },
      end: {
        type: String, // Format: "11:30"
        required: [true, 'End time is required'],
      },
    },
    totalDuration: {
      type: Number, // Total minutes
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    bookedVia: {
      type: String,
      enum: ['web', 'chatbot', 'admin', 'staff'],
      default: 'web',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index for efficient queries ──────────────────────────────
appointmentSchema.index({ customer: 1, date: -1 });
appointmentSchema.index({ staff: 1, date: 1, status: 1 });
appointmentSchema.index({ date: 1, status: 1 });

// ─── Static: Check for time slot conflicts ────────────────────
appointmentSchema.statics.hasConflict = async function (staffId, date, startTime, endTime, excludeId = null) {
  const query = {
    staff: staffId,
    date: date,
    status: { $nin: ['cancelled', 'no-show'] },
    $or: [
      {
        'timeSlot.start': { $lt: endTime },
        'timeSlot.end': { $gt: startTime },
      },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflict = await this.findOne(query);
  return !!conflict;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
