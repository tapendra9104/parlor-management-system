/**
 * ============================================
 * SalonFlow — Validation Middleware
 * ============================================
 * Request validation using express-validator.
 * Reusable validation chains for common operations.
 */

const { body, validationResult } = require('express-validator');

/**
 * Process validation results and return errors if any.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// ─── Validation Rules ─────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]{10,15}$/).withMessage('Invalid phone number'),
  body('role')
    .optional()
    .isIn(['customer', 'staff', 'admin']).withMessage('Invalid role'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s-()]{10,15}$/).withMessage('Invalid phone number'),
];

const serviceRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Service name is required'),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  body('duration')
    .isInt({ min: 15, max: 480 }).withMessage('Duration must be 15-480 minutes'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

const appointmentRules = [
  body('staff')
    .notEmpty().withMessage('Staff member is required')
    .isMongoId().withMessage('Invalid staff ID'),
  body('services')
    .isArray({ min: 1 }).withMessage('At least one service is required'),
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('timeSlot.start')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format (HH:MM)'),
];

const reviewRules = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  updateProfileRules,
  serviceRules,
  appointmentRules,
  reviewRules,
};
