import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(formData);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'staff') navigate('/staff/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
            <h2 className="auth-visual-title">Welcome Back! ✨</h2>
            <p className="auth-visual-text">
              Log in to manage your appointments, track your beauty journey, and chat with our AI assistant.
            </p>
            <div className="auth-visual-features">
              <span><FiCheck /> Smart AI-powered booking</span>
              <span><FiCheck /> Track your appointments</span>
              <span><FiCheck /> Personalized recommendations</span>
            </div>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <Link to="/" className="auth-logo">
                ✂️ Salon<span className="text-gradient">Flow</span>
              </Link>
              <h1 className="auth-title">Sign In</h1>
              <p className="auth-subtitle">Enter your credentials to access your account</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form" id="login-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    id="login-email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    id="login-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px', marginTop: '-8px' }}>
                <Link to="/forgot-password" className="auth-switch-link" style={{ fontSize: '0.8rem' }}>Forgot Password?</Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
                id="login-submit"
              >
                {loading ? <span className="spinner" style={{ width: 20, height: 20 }}></span> : <>Sign In <FiArrowRight /></>}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <p className="demo-title">🔑 Quick Demo Access:</p>
              <div className="demo-grid">
                <button className="demo-btn" onClick={() => setFormData({ email: 'admin@salonflow.com', password: 'admin123' })}>
                  👑 Admin
                </button>
                <button className="demo-btn" onClick={() => setFormData({ email: 'riya@salonflow.com', password: 'staff123' })}>
                  💇‍♀️ Staff
                </button>
                <button className="demo-btn" onClick={() => setFormData({ email: 'customer@salonflow.com', password: 'customer123' })}>
                  👤 Customer
                </button>
              </div>
            </div>

            <p className="auth-switch">
              Don't have an account? <Link to="/register" className="auth-switch-link">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
