import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiMail, FiLock, FiArrowRight, FiArrowLeft, FiHash, FiCheck, FiShield } from 'react-icons/fi';
import './Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newPassword
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.forgotPassword(email);
      setSuccess('If an account exists with that email, a reset OTP has been sent.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({ email, otp, newPassword });
      // Auto-login the user
      if (res.data?.token) {
        api.setToken(res.data.token);
      }
      setSuccess('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Reset failed. Check your OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-container">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-orb auth-orb-1"></div>
            <div className="auth-orb auth-orb-2"></div>
            <h2 className="auth-visual-title">
              {step === 1 ? 'Forgot Password? 🔐' : step === 2 ? 'Check Your Email 📧' : 'Almost Done! ✅'}
            </h2>
            <p className="auth-visual-text">
              {step === 1
                ? 'Enter your email and we\'ll send you a one-time password to reset it.'
                : step === 2
                ? 'We\'ve sent a 6-digit OTP to your email. Enter it below along with your new password.'
                : 'Your password has been reset successfully.'}
            </p>
            <div className="auth-visual-features">
              <span><FiCheck /> Secure OTP verification</span>
              <span><FiCheck /> 10-minute expiry</span>
              <span><FiCheck /> Instant password update</span>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                ✂️ Salon<span className="text-gradient">Flow</span>
              </Link>
              <h1 className="auth-title">
                {step === 1 ? 'Reset Password' : step === 2 ? 'Enter OTP' : ''}
              </h1>
              <p className="auth-subtitle">
                {step === 1
                  ? 'Enter your registered email address'
                  : 'Enter the 6-digit code sent to your email'}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="reset-progress">
              <div className={`reset-step ${step >= 1 ? 'active' : ''}`}>
                <span className="reset-step-num">1</span>
                <span className="reset-step-label">Email</span>
              </div>
              <div className="reset-step-line"></div>
              <div className={`reset-step ${step >= 2 ? 'active' : ''}`}>
                <span className="reset-step-num">2</span>
                <span className="reset-step-label">Verify & Reset</span>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : <>Send OTP <FiArrowRight /></>}
                </button>
              </form>
            )}

            {/* Step 2: OTP + New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label className="form-label">6-Digit OTP</label>
                  <div className="input-with-icon">
                    <FiHash className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      required
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      autoComplete="one-time-code"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-with-icon">
                    <FiShield className="input-icon" />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                  {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : <>Reset Password <FiCheck /></>}
                </button>

                <button type="button" className="btn btn-ghost" onClick={() => { setStep(1); setError(''); setSuccess(''); }} style={{ width: '100%', marginTop: 8 }}>
                  <FiArrowLeft /> Back to Email
                </button>
              </form>
            )}

            <p className="auth-switch">
              Remember your password? <Link to="/login" className="auth-switch-link">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
