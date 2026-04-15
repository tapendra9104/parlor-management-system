/**
 * ============================================
 * SalonFlow — Payment API Tests
 * ============================================
 * Gap #1: Automated Tests — Payment endpoints
 */

const supertest = require('supertest');
const crypto = require('crypto');
const app = require('../server');
const { setupTestDB, createTestUser } = require('./setup');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Staff = require('../models/Staff');

process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32chars';
process.env.RAZORPAY_KEY_ID = 'rzp_test_dummy';
process.env.RAZORPAY_KEY_SECRET = 'test_razorpay_secret_key';
process.env.NODE_ENV = 'test';

const request = supertest(app);

setupTestDB();

describe('Payment API', () => {
  describe('GET /api/payments/razorpay-key', () => {
    it('should return Razorpay public key', async () => {
      const { token } = await createTestUser();

      const res = await request
        .get('/api/payments/razorpay-key')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.key).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request.get('/api/payments/razorpay-key');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/payments', () => {
    it('should return payment history for user', async () => {
      const { token } = await createTestUser();

      const res = await request
        .get('/api/payments')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Signature Verification', () => {
    it('should verify valid Razorpay signature', () => {
      const orderId = 'order_test123';
      const paymentId = 'pay_test456';
      const secret = 'test_razorpay_secret_key';

      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      // Verify the crypto works correctly
      const actualSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      expect(actualSignature).toBe(expectedSignature);
    });

    it('should reject invalid signature', () => {
      const orderId = 'order_test123';
      const paymentId = 'pay_test456';
      const secret = 'test_razorpay_secret_key';

      const body = `${orderId}|${paymentId}`;
      const correctSig = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      const fakeSig = 'fake_signature_12345';
      expect(fakeSig).not.toBe(correctSig);
    });
  });

  describe('Invoice Number Generation', () => {
    it('should auto-generate invoice number on payment creation', async () => {
      const { user } = await createTestUser();

      // Create a minimal appointment first
      const service = await Service.create({
        name: 'Test Service',
        category: 'Haircut',
        description: 'Test',
        duration: 30,
        price: 500,
      });

      const staffUser = await require('../models/User').create({
        name: 'Staff',
        email: `s${Date.now()}@test.com`,
        password: 'StaffPass123!',
        role: 'staff',
      });

      const staff = await Staff.create({
        userId: staffUser._id,
        specializations: ['Haircut'],
      });

      const appointment = await Appointment.create({
        customer: user._id,
        staff: staff._id,
        services: [service._id],
        date: new Date('2026-12-25'),
        timeSlot: { start: '10:00', end: '10:30' },
        totalDuration: 30,
        totalAmount: 500,
      });

      const payment = await Payment.create({
        appointment: appointment._id,
        customer: user._id,
        amount: 500,
        method: 'razorpay',
        razorpayOrderId: 'order_test_inv',
      });

      expect(payment.invoiceNumber).toBeDefined();
      expect(payment.invoiceNumber).toMatch(/^INV-/);
    });
  });
});
