/**
 * ============================================
 * SalonFlow — Appointment Routes
 * ============================================
 * Gap #15: Swagger API documentation
 */

const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateStatus, cancelAppointment, getAvailableSlots } = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate, appointmentRules } = require('../middleware/validate');

/**
 * @swagger
 * /appointments/slots:
 *   get:
 *     summary: Get available time slots for a staff member
 *     tags: [Appointments]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: duration
 *         schema:
 *           type: integer
 *           default: 60
 *     responses:
 *       200:
 *         description: Available time slots
 */
router.get('/slots', getAvailableSlots);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get appointments (filtered by user role)
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, in-progress, completed, cancelled]
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of appointments
 */
router.get('/', protect, getAppointments);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [staff, services, date, timeSlot]
 *             properties:
 *               staff:
 *                 type: string
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *               date:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment created
 *       409:
 *         description: Time slot conflict
 */
router.post('/', protect, authorize('customer', 'admin'), appointmentRules, validate, createAppointment);

/**
 * @swagger
 * /appointments/{id}/status:
 *   put:
 *     summary: Update appointment status (admin/staff)
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:id/status', protect, authorize('admin', 'staff'), updateStatus);

/**
 * @swagger
 * /appointments/{id}/cancel:
 *   put:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled
 */
router.put('/:id/cancel', protect, cancelAppointment);

module.exports = router;
