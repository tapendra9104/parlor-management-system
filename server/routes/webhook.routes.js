/**
 * ============================================
 * SalonFlow — Razorpay Webhook Routes
 * ============================================
 * Gap #9: Webhook endpoint for payment events.
 */

const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../controllers/webhook.controller');

// POST /api/webhooks/razorpay — No auth (signature-verified internally)
router.post('/razorpay', handleWebhook);

module.exports = router;
