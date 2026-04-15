/**
 * ============================================
 * SalonFlow — Environment Configuration
 * ============================================
 * Centralized environment variable validation
 * and access. Fails fast if required vars are missing.
 */

require('dotenv').config();

const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
];

const optionalVars = {
  PORT: '5000',
  NODE_ENV: 'development',
  JWT_EXPIRES_IN: '7d',
  JWT_PREVIOUS_SECRET: '',
  CLIENT_URL: 'http://localhost:5173',
  GEMINI_API_KEY: '',
  RAZORPAY_KEY_ID: '',
  RAZORPAY_KEY_SECRET: '',
  RAZORPAY_WEBHOOK_SECRET: '',
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: '587',
  EMAIL_USER: '',
  EMAIL_PASS: '',
  DEMO_MODE: 'true',
};

// Validate required environment variables
const missing = requiredVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error('\n📋 Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

// Set defaults for optional variables
Object.entries(optionalVars).forEach(([key, defaultValue]) => {
  if (!process.env[key]) {
    process.env[key] = defaultValue;
  }
});

module.exports = {
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtPreviousSecret: process.env.JWT_PREVIOUS_SECRET || '',
  clientUrl: process.env.CLIENT_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  demoMode: process.env.DEMO_MODE === 'true',
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};
