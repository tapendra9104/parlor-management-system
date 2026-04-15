import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import './Auth.css';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (!agreed) {
      return setError('Please accept the terms and conditions');
    }
    setLoading(true);
    setError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        // Role is ALWAYS 'customer' — staff/admin accounts are created by admins only
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const pw = formData.password;
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'var(--danger)' };
    if (score <= 3) return { level: 2, label: 'Medium', color: 'var(--warning)' };
    return { level: 3, label: 'Strong', color: 'var(--success)' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-page page">
      <div className="auth-container">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <div className="auth-orb auth-orb-1"></div>
            <div className="auth-orb auth-orb-2"></div>
            <h2 className="auth-visual-title">Join SalonFlow 🌟</h2>
            <p className="auth-visual-text">
              Create your account and experience AI-powered salon management with personalized recommendations.
            </p>
            <div className="auth-visual-features">
              <span><FiCheck /> Instant online booking</span>
              <span><FiCheck /> AI-powered recommendations</span>
              <span><FiCheck /> Track your beauty journey</span>
              <span><FiCheck /> Exclusive member rewards</span>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                ✂️ Salon<span className="text-gradient">Flow</span>
              </Link>
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join thousands of happy customers</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form" id="register-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input type="text" name="name" className="form-input" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required id="register-name" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input type="email" name="email" className="form-input" placeholder="you@example.com" value={formData.email} onChange={handleChange} required id="register-email" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <FiPhone className="input-icon" />
                  <input type="tel" name="phone" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} id="register-phone" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input type={showPassword ? 'text' : 'password'} name="password" className="form-input" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required minLength={6} id="register-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bars">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="strength-bar" style={{ background: i <= strength.level ? strength.color : 'var(--border)' }} />
                      ))}
                    </div>
                    <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input type={showPassword ? 'text' : 'password'} name="confirmPassword" className="form-input" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required minLength={6} id="register-confirm-password" />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <span className="form-error">Passwords do not match</span>
                )}
              </div>

              <div className="terms-checkbox">
                <label className="checkbox-label">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span className="checkbox-custom"></span>
                  <span>I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a></span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading || !agreed} id="register-submit">
                {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : <>Create Account <FiArrowRight /></>}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login" className="auth-switch-link">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
