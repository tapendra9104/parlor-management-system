/**
 * ============================================
 * SalonFlow — Profile Page
 * ============================================
 * User profile management with personal info,
 * password change, and preference settings.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiUser, FiMail, FiPhone, FiLock, FiSave,
  FiEdit2, FiCalendar, FiShield, FiHeart,
  FiSun, FiMoon, FiBell, FiCamera, FiCheck
} from 'react-icons/fi';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);

  // Personal info form
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    phone: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    promotions: true,
  });

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        name: user.name || '',
        phone: user.phone || '',
      });
      if (user.preferences) {
        setPreferences({
          emailNotifications: user.preferences.emailNotifications ?? true,
          smsNotifications: user.preferences.smsNotifications ?? false,
          promotions: user.preferences.promotions ?? true,
        });
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.updateProfile({
        name: personalInfo.name,
        phone: personalInfo.phone,
      });
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const res = await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      api.setToken(res.data.token);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async () => {
    setLoading(true);
    try {
      const res = await api.updateProfile({ preferences });
      updateUser(res.data.user);
      toast.success('Preferences saved!');
    } catch (err) {
      toast.error(err.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';
  };

  const getRoleBadge = (role) => {
    const map = {
      admin: { class: 'badge-primary', label: 'Administrator' },
      staff: { class: 'badge-info', label: 'Staff Member' },
      customer: { class: 'badge-success', label: 'Customer' },
    };
    return map[role] || { class: 'badge-primary', label: role };
  };

  const tabs = [
    { id: 'personal', icon: <FiUser />, label: 'Personal Info' },
    { id: 'security', icon: <FiLock />, label: 'Security' },
    { id: 'preferences', icon: <FiHeart />, label: 'Preferences' },
  ];

  if (!user) return null;

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="page profile-page">
      <div className="container">
        {/* Page Header */}
        <div className="profile-header animate-fadeInUp">
          <div className="profile-hero-card glass-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {getInitials(user.name)}
                <div className="avatar-status-dot"></div>
              </div>
              <div className="profile-info-main">
                <h1 className="profile-name">{user.name}</h1>
                <p className="profile-email">
                  <FiMail /> {user.email}
                </p>
                <div className="profile-meta">
                  <span className={`badge ${roleBadge.class}`}>
                    <FiShield size={12} /> {roleBadge.label}
                  </span>
                  <span className="profile-joined">
                    <FiCalendar size={14} />
                    Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs animate-fadeInUp stagger-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="profile-content animate-fadeInUp stagger-3">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="profile-section">
              <div className="section-header">
                <h2><FiUser /> Personal Information</h2>
                <p className="text-muted">Update your personal details</p>
              </div>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-with-icon">
                      <FiUser className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-with-icon">
                      <FiMail className="input-icon" />
                      <input
                        type="email"
                        className="form-input"
                        value={user.email}
                        disabled
                        style={{ opacity: 0.6 }}
                      />
                    </div>
                    <span className="form-hint">Email cannot be changed</span>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-with-icon">
                      <FiPhone className="input-icon" />
                      <input
                        type="tel"
                        className="form-input"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Account Role</label>
                    <div className="input-with-icon">
                      <FiShield className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        value={roleBadge.label}
                        disabled
                        style={{ opacity: 0.6 }}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> : <><FiSave /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="profile-section">
              <div className="section-header">
                <h2><FiLock /> Change Password</h2>
                <p className="text-muted">Keep your account secure</p>
              </div>
              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input
                      type="password"
                      className="form-input"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="input-with-icon">
                      <FiLock className="input-icon" />
                      <input
                        type="password"
                        className="form-input"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-with-icon">
                      <FiLock className="input-icon" />
                      <input
                        type="password"
                        className="form-input"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> : <><FiShield /> Update Password</>}
                  </button>
                </div>
              </form>

              {/* Security Info */}
              <div className="security-info-card">
                <h3>🔒 Security Tips</h3>
                <ul>
                  <li><FiCheck /> Use a strong password with 8+ characters</li>
                  <li><FiCheck /> Include uppercase, lowercase, numbers & symbols</li>
                  <li><FiCheck /> Don't reuse passwords from other websites</li>
                  <li><FiCheck /> Change your password every 3 months</li>
                </ul>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="profile-section">
              <div className="section-header">
                <h2><FiHeart /> Preferences</h2>
                <p className="text-muted">Manage your notification and display preferences</p>
              </div>

              <div className="preferences-list">
                <div className="preference-item">
                  <div className="preference-info">
                    <div className="preference-icon"><FiMail /></div>
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive booking confirmations and reminders via email</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <div className="preference-icon"><FiPhone /></div>
                    <div>
                      <h4>SMS Notifications</h4>
                      <p>Get text messages for appointment updates</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.smsNotifications}
                      onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <div className="preference-icon"><FiBell /></div>
                    <div>
                      <h4>Promotional Updates</h4>
                      <p>Receive offers, discounts, and new service alerts</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.promotions}
                      onChange={(e) => setPreferences({ ...preferences, promotions: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleUpdatePreferences} disabled={loading}>
                  {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> : <><FiSave /> Save Preferences</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
