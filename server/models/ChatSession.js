/**
 * ============================================
 * SalonFlow — Chat Session Model
 * ============================================
 * Stores AI chatbot conversation history
 * per user for context-aware responses.
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    action: {
      type: {
        type: String,
        enum: ['book_appointment', 'check_slots', 'suggest_service', 'cancel_appointment', 'info', 'none'],
        default: 'none',
      },
      data: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [messageSchema],
    context: {
      currentIntent: { type: String, default: '' },
      pendingBooking: {
        service: { type: String, default: '' },
        date: { type: String, default: '' },
        time: { type: String, default: '' },
        staff: { type: String, default: '' },
      },
      resolved: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ────────────────────────────────────────────────────
chatSessionSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
