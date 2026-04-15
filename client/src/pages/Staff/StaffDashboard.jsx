/**
 * ============================================
 * SalonFlow — Staff Dashboard
 * ============================================
 * Dashboard for staff members showing their
 * appointments, ratings, and performance.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiClock, FiStar, FiTrendingUp,
  FiUser, FiCheck, FiX, FiChevronRight,
  FiAward, FiActivity, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeView, setActiveView] = useState('today');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.getAppointments();
      // API returns { data: { appointments: [...] } }
      const appts = res.data?.appointments || res.data || [];
      setAppointments(Array.isArray(appts) ? appts : []);
    } catch (err) {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { class: 'badge-warning', label: 'Pending' },
      confirmed: { class: 'badge-info', label: 'Confirmed' },
      'in-progress': { class: 'badge-primary', label: 'In Progress' },
      completed: { class: 'badge-success', label: 'Completed' },
      cancelled: { class: 'badge-danger', label: 'Cancelled' },
      'no-show': { class: 'badge-danger', label: 'No Show' },
    };
    return map[status] || { class: 'badge-primary', label: status };
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const todayAppointments = appointments.filter(a => {
    const aDate = new Date(a.date).toISOString().split('T')[0];
    return aDate === todayDate && a.status !== 'cancelled';
  });

  const upcomingAppointments = appointments.filter(a => {
    const aDate = new Date(a.date).toISOString().split('T')[0];
    return aDate > todayDate && a.status !== 'cancelled';
  });

  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const pendingCount = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;

  const displayAppointments = activeView === 'today' ? todayAppointments : upcomingAppointments;

  if (loading) {
    return (
      <div className="page staff-dashboard-page">
        <div className="container">
          <div className="loading-page">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page staff-dashboard-page">
      <div className="container">
        {/* Welcome Header */}
        <div className="staff-welcome animate-fadeInUp">
          <div className="welcome-text">
            <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-muted">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="staff-stats grid-4 animate-fadeInUp stagger-2">
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple"><FiCalendar /></div>
            <div>
              <div className="stat-value">{todayAppointments.length}</div>
              <div className="stat-label">Today's Appointments</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-orange"><FiClock /></div>
            <div>
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-teal"><FiCheckCircle /></div>
            <div>
              <div className="stat-value">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-pink"><FiTrendingUp /></div>
            <div>
              <div className="stat-value">{upcomingAppointments.length}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="staff-appointments-section animate-fadeInUp stagger-3">
          <div className="section-top-bar">
            <h2><FiCalendar /> Appointments</h2>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${activeView === 'today' ? 'active' : ''}`}
                onClick={() => setActiveView('today')}
              >
                Today ({todayAppointments.length})
              </button>
              <button
                className={`toggle-btn ${activeView === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveView('upcoming')}
              >
                Upcoming ({upcomingAppointments.length})
              </button>
            </div>
          </div>

          <div className="appointment-list">
            {displayAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h2 className="empty-state-title">
                  {activeView === 'today' ? 'No appointments today' : 'No upcoming appointments'}
                </h2>
                <p className="empty-state-text">
                  {activeView === 'today'
                    ? 'Enjoy your free time! No appointments are scheduled for today.'
                    : 'No upcoming appointments scheduled.'}
                </p>
              </div>
            ) : (
              displayAppointments.map((appt, idx) => {
                const badge = getStatusBadge(appt.status);
                return (
                  <div key={appt._id || idx} className="appt-card card" style={{ animationDelay: `${idx * 0.08}s` }}>
                    <div className="appt-card-top">
                      <div className="appt-time-badge">
                        <FiClock />
                        {formatTime(appt.timeSlot?.start)} - {formatTime(appt.timeSlot?.end)}
                      </div>
                      <span className={`badge ${badge.class}`}>{badge.label}</span>
                    </div>

                    <div className="appt-card-body">
                      <div className="appt-client">
                        <div className="avatar avatar-sm">
                          {(appt.customer?.name || 'C')[0].toUpperCase()}
                        </div>
                        <div>
                          <strong>{appt.customer?.name || 'Customer'}</strong>
                          <div className="text-muted text-sm">{appt.customer?.phone || ''}</div>
                        </div>
                      </div>
                      <div className="appt-services">
                        {(appt.services || []).map((svc, i) => (
                          <span key={i} className="service-chip">
                            {svc.service?.name || svc.name || 'Service'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {(appt.status === 'pending' || appt.status === 'confirmed') && (
                      <div className="appt-card-actions">
                        {appt.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleStatusUpdate(appt._id, 'confirmed')}
                          >
                            <FiCheck /> Confirm
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleStatusUpdate(appt._id, 'in-progress')}
                        >
                          <FiActivity /> Start
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleStatusUpdate(appt._id, 'no-show')}
                        >
                          <FiX /> No Show
                        </button>
                      </div>
                    )}
                    {appt.status === 'in-progress' && (
                      <div className="appt-card-actions">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleStatusUpdate(appt._id, 'completed')}
                        >
                          <FiCheckCircle /> Mark Complete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="staff-tips animate-fadeInUp stagger-4">
          <h3>💡 Quick Tips</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">⏰</div>
              <h4>Be Punctual</h4>
              <p>Start appointments on time for the best customer experience.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">💬</div>
              <h4>Communicate</h4>
              <p>Keep customers informed about wait times and service details.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">⭐</div>
              <h4>Ask for Reviews</h4>
              <p>Encourage satisfied customers to leave positive reviews.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
