/**
 * ============================================
 * SalonFlow — Payment Routes
 * ============================================
 * Gap #15: Swagger API documentation
 */

const express = require('express');
const router = express.Router();
const {
  getRazorpayKey,
  createOrder,
  verifyPayment,
  getPayments,
  getPayment,
} = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /payments/razorpay-key:
 *   get:
 *     summary: Get Razorpay public key for frontend checkout
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Razorpay key
 */
router.get('/razorpay-key', protect, getRazorpayKey);

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Create a Razorpay payment order
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId]
 *             properties:
 *               appointmentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created with Razorpay order ID
 *       404:
 *         description: Appointment not found
 */
router.post('/create-order', protect, createOrder);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify Razorpay payment (HMAC SHA256 signature)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *               paymentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 *       400:
 *         description: Signature mismatch
 */
router.post('/verify', protect, verifyPayment);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get payment history (paginated)
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated payment history
 */
router.get('/', protect, getPayments);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */
router.get('/:id', protect, getPayment);

module.exports = router;
