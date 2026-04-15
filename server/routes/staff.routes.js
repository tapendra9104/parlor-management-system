const express = require('express');
const router = express.Router();
const {
  createStaff,
  getAllStaff,
  getStaff,
  updateStaff,
  getStaffAvailability,
  deleteStaff,
} = require('../controllers/staff.controller');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllStaff);
router.get('/:id', getStaff);
router.get('/:id/availability', getStaffAvailability);

// Admin routes
router.post('/', protect, authorize('admin'), createStaff);
router.put('/:id', protect, authorize('admin', 'staff'), updateStaff);
router.delete('/:id', protect, authorize('admin'), deleteStaff);

module.exports = router;
