/**
 * ============================================
 * SalonFlow — Email Queue (Agenda)
 * ============================================
 * Background job processing for emails using Agenda.
 * Supports retries, backoff, and scheduled jobs.
 *
 * Gap #13: Email Queue
 */

const Agenda = require('agenda');
const config = require('../config/env');
const logger = require('../config/logger');

let agenda = null;

/**
 * Initialize Agenda with MongoDB connection.
 */
const initEmailQueue = async () => {
  try {
    agenda = new Agenda({
      db: {
        address: config.mongodbUri,
        collection: 'emailJobs',
      },
      processEvery: '30 seconds',
      maxConcurrency: 5,
    });

    // Define email jobs
    agenda.define('send-payment-receipt', { priority: 'high', concurrency: 3 }, async (job) => {
      const { customer, payment, appointment } = job.attrs.data;
      const { sendPaymentReceipt } = require('../services/emailService');
      await sendPaymentReceipt(customer, payment, appointment);
      logger.info('Email job completed: payment-receipt', { to: customer.email });
    });

    agenda.define('send-booking-confirmation', { priority: 'high', concurrency: 3 }, async (job) => {
      const { customer, appointment } = job.attrs.data;
      const { sendBookingConfirmation } = require('../services/emailService');
      await sendBookingConfirmation(customer, appointment);
      logger.info('Email job completed: booking-confirmation', { to: customer.email });
    });

    agenda.define('send-appointment-reminder', { priority: 'normal', concurrency: 3 }, async (job) => {
      const { customer, appointment } = job.attrs.data;
      const { sendAppointmentReminder } = require('../services/emailService');
      await sendAppointmentReminder(customer, appointment);
      logger.info('Email job completed: appointment-reminder', { to: customer.email });
    });

    agenda.define('send-password-reset', { priority: 'highest', concurrency: 5 }, async (job) => {
      const { email, otp, name } = job.attrs.data;
      const { sendPasswordResetOTP } = require('../services/emailService');
      await sendPasswordResetOTP(email, otp, name);
      logger.info('Email job completed: password-reset', { to: email });
    });

    // Error handling
    agenda.on('fail', (err, job) => {
      const maxRetries = 3;
      const attempts = job.attrs.failCount || 0;

      if (attempts < maxRetries) {
        // Exponential backoff: 1min, 5min, 25min
        const delay = Math.pow(5, attempts) * 60 * 1000;
        job.schedule(new Date(Date.now() + delay));
        job.save();
        logger.warn(`Email job failed (attempt ${attempts + 1}/${maxRetries}), retrying in ${delay / 1000}s`, {
          jobName: job.attrs.name,
          error: err.message,
        });
      } else {
        logger.error(`Email job permanently failed after ${maxRetries} attempts`, {
          jobName: job.attrs.name,
          error: err.message,
        });
      }
    });

    await agenda.start();
    logger.info('Email queue (Agenda) started successfully');

    return agenda;
  } catch (error) {
    logger.error('Failed to initialize email queue:', error);
    return null;
  }
};

/**
 * Queue an email job.
 * @param {string} jobName - Job name (e.g., 'send-payment-receipt')
 * @param {object} data - Job data
 * @param {Date} [scheduleAt] - Optional scheduled time
 */
const queueEmail = async (jobName, data, scheduleAt = null) => {
  if (!agenda) {
    // Fallback: send directly if queue isn't running
    logger.warn('Email queue not running, sending directly', { jobName });
    try {
      const emailService = require('../services/emailService');
      if (jobName === 'send-payment-receipt') {
        await emailService.sendPaymentReceipt(data.customer, data.payment, data.appointment);
      } else if (jobName === 'send-booking-confirmation') {
        await emailService.sendBookingConfirmation(data.customer, data.appointment);
      } else if (jobName === 'send-password-reset') {
        await emailService.sendPasswordResetOTP(data.email, data.otp, data.name);
      }
    } catch (err) {
      logger.error('Direct email send failed:', err);
    }
    return;
  }

  try {
    if (scheduleAt) {
      await agenda.schedule(scheduleAt, jobName, data);
    } else {
      await agenda.now(jobName, data);
    }
    logger.info(`Email job queued: ${jobName}`);
  } catch (error) {
    logger.error('Failed to queue email:', error);
  }
};

/**
 * Graceful shutdown.
 */
const stopEmailQueue = async () => {
  if (agenda) {
    await agenda.stop();
    logger.info('Email queue stopped');
  }
};

module.exports = { initEmailQueue, queueEmail, stopEmailQueue };
