/**
 * ============================================
 * SalonFlow — Appointment API Tests
 * ============================================
 * Gap #1: Automated Tests — Appointment endpoints
 */

const supertest = require('supertest');
const app = require('../server');
const { setupTestDB, createTestUser, createTestAdmin } = require('./setup');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Appointment = require('../models/Appointment');

process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32chars';
process.env.NODE_ENV = 'test';

const request = supertest(app);

setupTestDB();

let testService, testStaff;

const createTestData = async () => {
  testService = await Service.create({
    name: 'Test Haircut',
    category: 'Haircut',
    description: 'Test service',
    duration: 45,
    price: 500,
  });

  const staffUser = await require('../models/User').create({
    name: 'Test Stylist',
    email: `stylist${Date.now()}@salonflow.com`,
    password: 'StaffPass123!',
    role: 'staff',
  });

  testStaff = await Staff.create({
    userId: staffUser._id,
    specializations: ['Haircut'],
    workingHours: {
      monday: { start: '09:00', end: '18:00', isWorking: true },
      tuesday: { start: '09:00', end: '18:00', isWorking: true },
      wednesday: { start: '09:00', end: '18:00', isWorking: true },
      thursday: { start: '09:00', end: '18:00', isWorking: true },
      friday: { start: '09:00', end: '18:00', isWorking: true },
      saturday: { start: '09:00', end: '18:00', isWorking: true },
      sunday: { start: '09:00', end: '18:00', isWorking: false },
    },
  });
};

describe('Appointment API', () => {
  beforeEach(async () => {
    await createTestData();
  });

  describe('POST /api/appointments', () => {
    it('should create appointment as customer', async () => {
      const { token } = await createTestUser();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const res = await request
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          staff: testStaff._id,
          services: [testService._id],
          date: futureDate.toISOString().split('T')[0],
          timeSlot: { start: '10:00' },
          bookedVia: 'web',
        });

      expect([200, 201]).toContain(res.status);
    });

    it('should reject appointment without auth', async () => {
      const res = await request
        .post('/api/appointments')
        .send({
          staff: testStaff._id,
          services: [testService._id],
          date: '2026-12-25',
          timeSlot: { start: '10:00' },
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/appointments', () => {
    it('should return appointments for authenticated user', async () => {
      const { token } = await createTestUser();

      const res = await request
        .get('/api/appointments')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request.get('/api/appointments');
      expect(res.status).toBe(401);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect time slot conflicts', async () => {
      const date = new Date('2026-12-25');

      // Create first appointment
      const { user } = await createTestUser();
      await Appointment.create({
        customer: user._id,
        staff: testStaff._id,
        services: [testService._id],
        date,
        timeSlot: { start: '10:00', end: '11:00' },
        totalDuration: 60,
        totalAmount: 500,
        status: 'confirmed',
      });

      // Check conflict
      const hasConflict = await Appointment.hasConflict(
        testStaff._id,
        date,
        '10:30',
        '11:30'
      );
      expect(hasConflict).toBe(true);
    });

    it('should not detect conflict for different times', async () => {
      const date = new Date('2026-12-25');

      const { user } = await createTestUser();
      await Appointment.create({
        customer: user._id,
        staff: testStaff._id,
        services: [testService._id],
        date,
        timeSlot: { start: '10:00', end: '11:00' },
        totalDuration: 60,
        totalAmount: 500,
        status: 'confirmed',
      });

      const hasConflict = await Appointment.hasConflict(
        testStaff._id,
        date,
        '14:00',
        '15:00'
      );
      expect(hasConflict).toBe(false);
    });
  });
});
