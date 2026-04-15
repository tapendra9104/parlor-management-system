/**
 * ============================================
 * SalonFlow — Payment Controller (Razorpay)
 * ============================================
 * Full Razorpay integration with:
 * - Order creation
 * - Payment verification (HMAC SHA256)
 * - Payment history
 */

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const config = require('../config/env');
const { sendPaymentReceipt } = require('../services/emailService');

// ─── Initialize Razorpay Instance ─────────────────────────────
const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

/**
 * @desc    Get Razorpay public key (for frontend)
 * @route   GET /api/payments/razorpay-key
 * @access  Private
 */
const getRazorpayKey = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { key: config.razorpayKeyId },
  });
};

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payments/create-order
 * @access  Private (Customer)
 */
const createOrder = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('services', 'name price')
      .populate({ path: 'staff', populate: { path: 'userId', select: 'name' } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure the customer owns this appointment
    if (appointment.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const amount = appointment.totalAmount;

    // Create Razorpay order (amount in paisa)
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paisa
      currency: 'INR',
      receipt: `receipt_${appointmentId}_${Date.now()}`,
      notes: {
        appointmentId: appointmentId,
        customerId: req.user._id.toString(),
        customerName: req.user.name,
      },
    };

    const order = await razorpay.orders.create(options);

    // Create pending payment record
    const payment = await Payment.create({
      appointment: appointmentId,
      customer: req.user._id,
      amount: amount,
      currency: 'INR',
      method: 'razorpay',
      status: 'pending',
      razorpayOrderId: order.id,
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id,
        appointment: {
          id: appointment._id,
          services: appointment.services,
          staff: appointment.staff?.userId?.name || 'Staff',
          date: appointment.date,
          timeSlot: appointment.timeSlot,
          totalAmount: appointment.totalAmount,
        },
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payments/verify
 * @access  Private (Customer)
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    // 1. Verify signature using HMAC SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Update payment as failed
      await Payment.findByIdAndUpdate(paymentId, {
        status: 'failed',
        razorpayPaymentId: razorpay_payment_id,
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Signature mismatch.',
      });
    }

    // 2. Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        transactionId: razorpay_payment_id,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // 3. Update appointment status to confirmed and link payment
    const appointment = await Appointment.findByIdAndUpdate(
      payment.appointment,
      {
        status: 'confirmed',
        payment: payment._id,
      },
      { new: true }
    ).populate('services', 'name price duration')
     .populate({ path: 'staff', populate: { path: 'userId', select: 'name' } });

    // 4. Send notification
    const Notification = require('../models/Notification');
    const io = req.app.get('io');

    if (appointment) {
      const notification = await Notification.create({
        user: appointment.customer,
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Payment of ₹${payment.amount} received. Your appointment is confirmed!`,
        link: '/my-bookings',
      });

      if (io) {
        io.to(`user_${appointment.customer}`).emit('notification', notification);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully!',
      data: {
        payment,
        appointment,
      },
    });

    // Send payment receipt email (async, don't block response)
    const customer = await User.findById(payment.customer);
    if (customer) {
      sendPaymentReceipt(customer, payment, appointment).catch(() => {});
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
};

/**
 * @desc    Get payment history
 * @route   GET /api/payments
 * @access  Private
 */
const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = req.user.role === 'admin' ? {} : { customer: req.user._id };
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate({
        path: 'appointment',
        select: 'date timeSlot services totalAmount status',
        populate: { path: 'services', select: 'name price' },
      })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:id
 * @access  Private
 */
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('appointment')
      .populate('customer', 'name email');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRazorpayKey, createOrder, verifyPayment, getPayments, getPayment };
