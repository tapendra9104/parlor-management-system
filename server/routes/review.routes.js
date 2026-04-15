const express = require('express');
const router = express.Router();
const { createReview, getStaffReviews } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');
const { validate, reviewRules } = require('../middleware/validate');

router.post('/', protect, reviewRules, validate, createReview);
router.get('/staff/:staffId', getStaffReviews);

module.exports = router;
