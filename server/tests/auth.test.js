/**
 * ============================================
 * SalonFlow — Auth API Tests
 * ============================================
 * Gap #1: Automated Tests — Auth endpoints
 */

const supertest = require('supertest');
const app = require('../server');
const { setupTestDB, createTestUser } = require('./setup');

// Set test env
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-32chars';
process.env.NODE_ENV = 'test';

const request = supertest(app);

setupTestDB();

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@salonflow.com',
          password: 'SecurePass123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.name).toBe('New User');
      expect(res.body.data.user.role).toBe('customer');
    });

    it('should reject duplicate email', async () => {
      await createTestUser({ email: 'dup@salonflow.com' });

      const res = await request
        .post('/api/auth/register')
        .send({
          name: 'Dup User',
          email: 'dup@salonflow.com',
          password: 'SecurePass123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({
          name: 'Weak User',
          email: 'weak@salonflow.com',
          password: '123',
        });

      expect(res.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const res = await request
        .post('/api/auth/register')
        .send({ name: 'No Email' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await request.post('/api/auth/register').send({
        name: 'Login User',
        email: 'login@salonflow.com',
        password: 'SecurePass123!',
      });

      const res = await request
        .post('/api/auth/login')
        .send({
          email: 'login@salonflow.com',
          password: 'SecurePass123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject wrong password', async () => {
      await request.post('/api/auth/register').send({
        name: 'Wrong Pass',
        email: 'wrongpass@salonflow.com',
        password: 'CorrectPass123!',
      });

      const res = await request
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@salonflow.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const res = await request
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@salonflow.com',
          password: 'SomePass123!',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const { token } = await createTestUser({ email: 'me@salonflow.com' });

      const res = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('me@salonflow.com');
    });

    it('should reject request without token', async () => {
      const res = await request.get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});
