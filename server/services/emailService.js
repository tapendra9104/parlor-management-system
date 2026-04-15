/**
 * ============================================
 * SalonFlow — Email Service
 * ============================================
 * Transactional email service using Nodemailer.
 * Sends booking confirmations, payment receipts,
 * password resets, and welcome emails.
 * 
 * Falls back to console logging when SMTP
 * credentials are not configured.
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');

// ─── SMTP Transport ───────────────────────────────────────────
let transporter = null;
const isEmailConfigured = config.email.user && config.email.pass;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  // Verify connection
  transporter.verify()
    .then(() => console.log('📧 Email service connected'))
    .catch((err) => {
      console.warn('⚠️ Email service connection failed:', err.message);
      transporter = null;
    });
} else {
  console.log('📧 Email service: No SMTP credentials — emails will be logged to console');
}

// ─── Common HTML Wrapper ──────────────────────────────────────
const wrapHTML = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .email-header { background: linear-gradient(135deg, #C9345C, #A8284B); padding: 32px 24px; text-align: center; }
    .email-header h1 { color: white; font-size: 24px; font-weight: 700; }
    .email-header .brand { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px; }
    .email-body { padding: 32px 24px; color: #333; line-height: 1.6; }
    .email-body h2 { font-size: 20px; margin-bottom: 16px; color: #111; }
    .email-body p { margin-bottom: 12px; font-size: 15px; color: #555; }
    .info-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #888; font-weight: 500; }
    .info-value { color: #333; font-weight: 600; }
    .otp-box { background: linear-gradient(135deg, #C9345C, #A8284B); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 36px; font-weight: 800; color: white; letter-spacing: 8px; font-family: monospace; }
    .otp-label { color: rgba(255,255,255,0.8); font-size: 13px; margin-top: 8px; }
    .btn-cta { display: inline-block; background: linear-gradient(135deg, #C9345C, #A8284B); color: white; padding: 14px 32px; border-radius: 50px; font-weight: 700; text-decoration: none; font-size: 15px; margin-top: 16px; }
    .email-footer { background: #1a1a2e; padding: 24px; text-align: center; color: rgba(255,255,255,0.6); font-size: 12px; }
    .email-footer a { color: #C9345C; text-decoration: none; }
    .amount-highlight { font-size: 28px; font-weight: 800; color: #C9345C; }
    .status-badge { display: inline-block; padding: 4px 14px; border-radius: 50px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .status-confirmed { background: rgba(34,197,94,0.1); color: #22c55e; }
    .status-cancelled { background: rgba(220,53,69,0.1); color: #dc3545; }
  </style>
</head>
<body>
  <div style="padding: 24px;">
    <div class="email-container">
      <div class="email-header">
        <h1>✂️ SalonFlow</h1>
        <div class="brand">Premium Salon Management</div>
      </div>
      <div class="email-body">
        ${bodyContent}
      </div>
      <div class="email-footer">
        <p>&copy; ${new Date().getFullYear()} SalonFlow. All rights reserved.</p>
        <p style="margin-top: 8px;">123 Beauty Lane, Andheri West, Mumbai - 400058</p>
      </div>
    </div>
  </div>
</body>
</html>`;

// ─── Send Email Helper ────────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.log(`\n📧 [EMAIL LOG] To: ${to} | Subject: ${subject}`);
    console.log('─'.repeat(50));
    return { success: true, mode: 'console' };
  }

  try {
    await transporter.sendMail({
      from: `"SalonFlow" <${config.email.user}>`,
      to,
      subject,
      html,
    });
    return { success: true, mode: 'smtp' };
  } catch (error) {
    console.error('📧 Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════

/**
 * Welcome email sent on registration
 */
const sendWelcomeEmail = async (user) => {
  const html = wrapHTML('Welcome to SalonFlow', `
    <h2>Welcome, ${user.name}! 🎉</h2>
    <p>Thank you for joining SalonFlow. Your account has been created successfully.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Name</span>
        <span class="info-value">${user.name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">${user.email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Account Type</span>
        <span class="info-value" style="text-transform: capitalize;">${user.role}</span>
      </div>
    </div>
    <p>You can now book appointments, manage your profile, and enjoy premium salon services.</p>
    <a href="${config.clientUrl}/booking" class="btn-cta">Book Your First Appointment →</a>
  `);

  return sendEmail(user.email, 'Welcome to SalonFlow! ✨', html);
};

/**
 * Booking confirmation email
 */
const sendBookingConfirmation = async (user, appointment, services) => {
  const serviceList = services.map(s => `
    <div class="info-row">
      <span class="info-label">${s.name}</span>
      <span class="info-value">₹${s.price} · ${s.duration} min</span>
    </div>
  `).join('');

  const date = new Date(appointment.date).toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const html = wrapHTML('Booking Confirmed', `
    <h2>Booking Confirmed! ✅</h2>
    <p>Hi ${user.name}, your appointment has been booked successfully.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Date</span>
        <span class="info-value">${date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time</span>
        <span class="info-value">${appointment.timeSlot.start} — ${appointment.timeSlot.end}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Duration</span>
        <span class="info-value">${appointment.totalDuration} minutes</span>
      </div>
    </div>
    <h3 style="margin: 20px 0 8px; font-size: 15px; color: #888;">Services</h3>
    <div class="info-box">
      ${serviceList}
      <div class="info-row" style="border-top: 2px solid #e0e0e0; margin-top: 8px; padding-top: 12px;">
        <span class="info-label" style="font-weight: 700; color: #333;">Total</span>
        <span class="info-value" style="color: #C9345C; font-size: 18px;">₹${appointment.totalAmount}</span>
      </div>
    </div>
    <p style="color: #888; font-size: 13px;">Need to make changes? You can cancel your appointment from your dashboard.</p>
    <a href="${config.clientUrl}/my-bookings" class="btn-cta">View My Bookings →</a>
  `);

  return sendEmail(user.email, `Booking Confirmed — ${date}`, html);
};

/**
 * Booking cancellation email
 */
const sendBookingCancellation = async (user, appointment) => {
  const date = new Date(appointment.date).toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const html = wrapHTML('Booking Cancelled', `
    <h2>Appointment Cancelled</h2>
    <p>Hi ${user.name}, your appointment has been cancelled.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Date</span>
        <span class="info-value">${date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time</span>
        <span class="info-value">${appointment.timeSlot?.start} — ${appointment.timeSlot?.end}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value"><span class="status-badge status-cancelled">Cancelled</span></span>
      </div>
      <div class="info-row">
        <span class="info-label">Reason</span>
        <span class="info-value">${appointment.cancellationReason || 'Not specified'}</span>
      </div>
    </div>
    <p>If you'd like to rebook, you can do so anytime.</p>
    <a href="${config.clientUrl}/booking" class="btn-cta">Book Again →</a>
  `);

  return sendEmail(user.email, 'Appointment Cancelled — SalonFlow', html);
};

/**
 * Payment receipt email
 */
const sendPaymentReceipt = async (user, payment, appointment) => {
  const date = new Date(payment.createdAt).toLocaleDateString('en-IN', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const html = wrapHTML('Payment Receipt', `
    <h2>Payment Successful! 💳</h2>
    <p>Hi ${user.name}, we've received your payment.</p>
    <div style="text-align: center; margin: 24px 0;">
      <div class="amount-highlight">₹${payment.amount}</div>
      <p style="color: #22c55e; font-weight: 600; margin-top: 4px;">✓ Payment Confirmed</p>
    </div>
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Transaction ID</span>
        <span class="info-value" style="font-family: monospace; font-size: 12px;">${payment.razorpayPaymentId || payment.transactionId || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method</span>
        <span class="info-value" style="text-transform: capitalize;">${payment.method || 'Razorpay'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date</span>
        <span class="info-value">${date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status</span>
        <span class="info-value"><span class="status-badge status-confirmed">Completed</span></span>
      </div>
    </div>
    <p style="font-size: 13px; color: #888;">Your appointment has been automatically confirmed. We look forward to seeing you!</p>
    <a href="${config.clientUrl}/my-bookings" class="btn-cta">View Booking →</a>
  `);

  return sendEmail(user.email, `Payment Receipt — ₹${payment.amount}`, html);
};

/**
 * Password reset OTP email
 */
const sendPasswordResetOTP = async (user, otp) => {
  const html = wrapHTML('Password Reset', `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name}, we received a request to reset your password. Use the OTP below to proceed:</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-label">This code expires in 10 minutes</div>
    </div>
    <p style="font-size: 13px; color: #888;">If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
    <p style="font-size: 12px; color: #ccc; margin-top: 20px;">For security, never share this OTP with anyone.</p>
  `);

  return sendEmail(user.email, 'Password Reset OTP — SalonFlow', html);
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendPaymentReceipt,
  sendPasswordResetOTP,
};
