/**
 * ============================================
 * SalonFlow — Service API Tests
 * ============================================
 * Gap #1: Automated Tests — Service endpoints
 */

const supertest = require('supertest');
const app = require('../server');
const { setupTestDB, createTestAdmin, createTestUser } = require('./setup');
const Service = require('../models/Service');

process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32chars';
process.env.NODE_ENV = 'test';

const request = supertest(app);

setupTestDB();

const sampleService = {
  name: 'Classic Haircut',
  category: 'Haircut',
  description: 'Professional haircut with wash and styling',
  duration: 45,
  price: 500,
};

describe('Service API', () => {
  describe('GET /api/services', () => {
    it('should return list of services (public)', async () => {
      await Service.create(sampleService);

      const res = await request.get('/api/services');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data || res.body)).toBe(true);
    });

    it('should filter by category', async () => {
      await Service.create(sampleService);
      await Service.create({ ...sampleService, name: 'Gold Facial', category: 'Facial' });

      const res = await request.get('/api/services?category=Haircut');

      expect(res.status).toBe(200);
      const services = res.body.data || res.body;
      services.forEach((s) => {
        expect(s.category).toBe('Haircut');
      });
    });
  });

  describe('POST /api/services', () => {
    it('should create service as admin', async () => {
      const { token } = await createTestAdmin();

      const res = await request
        .post('/api/services')
        .set('Authorization', `Bearer ${token}`)
        .send(sampleService);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject service creation as customer', async () => {
      const { token } = await createTestUser();

      const res = await request
        .post('/api/services')
        .set('Authorization', `Bearer ${token}`)
        .send(sampleService);

      expect(res.status).toBe(403);
    });

    it('should reject invalid service data', async () => {
      const { token } = await createTestAdmin();

      const res = await request
        .post('/api/services')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Incomplete' }); // Missing required fields

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/services/:id', () => {
    it('should update service as admin', async () => {
      const { token } = await createTestAdmin();
      const service = await Service.create(sampleService);

      const res = await request
        .put(`/api/services/${service._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 750 });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete service as admin', async () => {
      const { token } = await createTestAdmin();
      const service = await Service.create(sampleService);

      const res = await request
        .delete(`/api/services/${service._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});
