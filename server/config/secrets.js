/**
 * ============================================
 * SalonFlow — Secrets Manager
 * ============================================
 * Abstraction layer for secret management.
 * Supports graceful JWT rotation with fallback
 * to previous secret during transition window.
 *
 * Gap #3: JWT Secret Rotation
 */

const crypto = require('crypto');

/**
 * Validates that a JWT secret meets minimum security requirements.
 * @param {string} secret - The JWT secret to validate
 * @returns {{ valid: boolean, reason?: string }}
 */
const validateSecretStrength = (secret) => {
  if (!secret) return { valid: false, reason: 'JWT_SECRET is not set' };
  if (secret.length < 32) return { valid: false, reason: 'JWT_SECRET must be at least 32 characters' };
  if (secret === 'your-jwt-secret' || secret === 'changeme' || secret === 'secret') {
    return { valid: false, reason: 'JWT_SECRET is using a default/insecure value' };
  }
  return { valid: true };
};

/**
 * Generate a cryptographically secure secret.
 * Useful for initial setup or rotation.
 * @param {number} length - Byte length (default 64 → 128 hex chars)
 * @returns {string}
 */
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Get the current and previous JWT secrets for rotation support.
 * During rotation, tokens signed with the previous secret are still valid.
 */
const getJwtSecrets = () => {
  const current = process.env.JWT_SECRET;
  const previous = process.env.JWT_PREVIOUS_SECRET || null;

  return { current, previous };
};

module.exports = {
  validateSecretStrength,
  generateSecret,
  getJwtSecrets,
};
