/**
 * ============================================
 * SalonFlow — Razorpay Webhook Controller
 * ============================================
 * Handles Razorpay webhook events for reliable
 * payment confirmation. Server-side backup to
 * client-side payment verification.
 *
 * Gap #9: Razorpay Webhooks
 */

const crypto = require('crypto');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const config = require('../config/env');
const logger = require('../config/logger');

/**
 * Verify Razorpay webhook signature.
 * Uses HMAC SHA256 with webhook secret.
 */
const verifyWebhookSignature = (body, signature) => {
  const secret = config.razorpayWebhookSecret || config.razorpayKeySecret;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

/**
 * @desc    Handle Razorpay webhook events
 * @route   POST /api/webhooks/razorpay
 * @access  Public (signature-verified)
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody;

    // Verify signature
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      logger.warn('Razorpay webhook: Invalid signature', { signature });
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    const eventType = event.event;

    logger.info(`Razorpay webhook received: ${eventType}`, {
      eventId: event.payload?.payment?.entity?.id,
    });

    switch (eventType) {
      case 'payment.captured': {
        await handlePaymentCaptured(event.payload.payment.entity, req);
        break;
      }
      case 'payment.failed': {
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      }
      case 'order.paid': {
        await handleOrderPaid(event.payload.order.entity, event.payload.payment?.entity);
        break;
      }
      default:
        logger.info(`Razorpay webhook: Unhandled event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    logger.error('Razorpay webhook error:', error);
    // Still return 200 to prevent Razorpay from retrying
    res.status(200).json({ success: true, message: 'Webhook received (with error)' });
  }
};

/**
 * Handle payment.captured event
 */
const handlePaymentCaptured = async (paymentEntity, req) => {
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;

  // Find payment by Razorpay order ID
  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (!payment) {
    logger.warn('Webhook: Payment not found for order', { orderId });
    return;
  }

  // Skip if already completed (client-side verification already processed)
  if (payment.status === 'completed') {
    logger.info('Webhook: Payment already completed', { orderId });
    return;
  }

  // Update payment
  payment.status = 'completed';
  payment.razorpayPaymentId = paymentId;
  payment.transactionId = paymentId;
  await payment.save();

  // Update appointment status
  await Appointment.findByIdAndUpdate(payment.appointment, {
    status: 'confirmed',
    payment: payment._id,
  });

  // Send notification
  const io = req.app.get('io');
  const notification = await Notification.create({
    user: payment.customer,
    type: 'payment_success',
    title: 'Payment Confirmed',
    message: `Payment of ₹${payment.amount} has been confirmed via webhook.`,
    link: '/my-bookings',
  });

  if (io) {
    io.to(`user_${payment.customer}`).emit('notification', notification);
  }

  logger.info('Webhook: Payment captured successfully', { orderId, paymentId });
};

/**
 * Handle payment.failed event
 */
const handlePaymentFailed = async (paymentEntity) => {
  const orderId = paymentEntity.order_id;

  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (!payment) return;

  if (payment.status !== 'pending') return;

  payment.status = 'failed';
  payment.razorpayPaymentId = paymentEntity.id;
  await payment.save();

  logger.warn('Webhook: Payment failed', { orderId, reason: paymentEntity.error_description });
};

/**
 * Handle order.paid event
 */
const handleOrderPaid = async (orderEntity, paymentEntity) => {
  const orderId = orderEntity.id;

  const payment = await Payment.findOne({ razorpayOrderId: orderId });
  if (!payment || payment.status === 'completed') return;

  payment.status = 'completed';
  if (paymentEntity) {
    payment.razorpayPaymentId = paymentEntity.id;
    payment.transactionId = paymentEntity.id;
  }
  await payment.save();

  await Appointment.findByIdAndUpdate(payment.appointment, {
    status: 'confirmed',
    payment: payment._id,
  });

  logger.info('Webhook: Order paid', { orderId });
};

module.exports = { handleWebhook };
