/**
 * ============================================
 * SalonFlow — Test Setup & Utilities
 * ============================================
 * Gap #1: Automated Tests
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let mongoServer;

/**
 * Connect to in-memory MongoDB before all tests.
 */
const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });
};

/**
 * Create a test user and return user + JWT token.
 */
const createTestUser = async (overrides = {}) => {
  const userData = {
    name: 'Test User',
    email: `test${Date.now()}@salonflow.com`,
    password: 'TestPass123!',
    role: 'customer',
    ...overrides,
  };

  const user = await User.create(userData);
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only-32chars',
    { expiresIn: '1h' }
  );

  return { user, token };
};

/**
 * Create an admin user for testing.
 */
const createTestAdmin = async () => {
  return createTestUser({ name: 'Admin User', email: `admin${Date.now()}@salonflow.com`, role: 'admin' });
};

/**
 * Create a staff user for testing.
 */
const createTestStaff = async () => {
  return createTestUser({ name: 'Staff User', email: `staff${Date.now()}@salonflow.com`, role: 'staff' });
};

module.exports = {
  setupTestDB,
  createTestUser,
  createTestAdmin,
  createTestStaff,
};
