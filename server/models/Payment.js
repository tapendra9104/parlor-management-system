/**
 * ============================================
 * SalonFlow — Payment Model
 * ============================================
 * Tracks payment transactions linked to
 * appointments. Supports Razorpay and cash.
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: ['razorpay', 'card', 'cash', 'upi', 'wallet', 'netbanking'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Razorpay fields
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    transactionId: {
      type: String,
      default: '',
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    refundId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-save: Generate invoice number ────────────────────────
paymentSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// ─── Index ────────────────────────────────────────────────────
paymentSchema.index({ customer: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
