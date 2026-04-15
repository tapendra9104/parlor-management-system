/**
 * ============================================
 * SalonFlow — Customer Dashboard
 * ============================================
 * Premium customer portal with next appointment
 * countdown, booking history, and quick actions.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FiCalendar, FiClock, FiScissors, FiStar,
  FiArrowRight, FiGift, FiTrendingUp, FiHeart,
  FiPlus, FiUser, FiBell
} from 'react-icons/fi';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    loyaltyPoints: 250,
  });
  const [nextBooking, setNextBooking] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.getAppointments('');
      const data = res.data?.data || res.data;
      const appointments = data?.appointments || data || [];

      const now = new Date();
      const upcoming = appointments.filter(a => new Date(a.date) >= now && a.status !== 'cancelled');
      const completed = appointments.filter(a => a.status === 'completed');

      setStats({
        totalBookings: appointments.length,
        upcomingBookings: upcoming.length,
        completedBookings: completed.length,
        loyaltyPoints: completed.length * 50 + 250,
      });

      if (upcoming.length > 0) {
        const sorted = upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        setNextBooking(sorted[0]);
      }

      setRecentBookings(appointments.slice(0, 5));
    } catch {
      // Fallback demo data
      setStats({
        totalBookings: 12,
        upcomingBookings: 2,
        completedBookings: 10,
        loyaltyPoints: 750,
      });
      setNextBooking({
        _id: 'demo1',
        date: new Date(Date.now() + 86400000 * 2).toISOString(),
        timeSlot: { start: '10:00', end: '11:30' },
        services: [{ name: 'Premium Haircut', duration: 45, price: 1200 }],
        staff: { userId: { name: 'Riya Sharma' } },
        status: 'confirmed',
      });
      setRecentBookings([
        {
          _id: 'demo2',
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
          services: [{ name: 'Hair Spa' }],
          status: 'completed',
          totalAmount: 1200,
        },
        {
          _id: 'demo3',
          date: new Date(Date.now() - 86400000 * 10).toISOString(),
          services: [{ name: 'Gold Facial' }],
          status: 'completed',
          totalAmount: 1500,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getTimeUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    if (diff <= 0) return 'Today';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Soon';
  };

  const getStatusBadge = (status) => {
    const map = {
      confirmed: 'badge-success',
      pending: 'badge-warning',
      completed: 'badge-info',
      cancelled: 'badge-danger',
    };
    return map[status] || 'badge-primary';
  };

  const quickActions = [
    { icon: <FiPlus />, label: 'Book Now', link: '/booking', color: 'var(--primary)' },
    { icon: <FiCalendar />, label: 'My Bookings', link: '/my-bookings', color: 'var(--info)' },
    { icon: <FiUser />, label: 'My Profile', link: '/profile', color: 'var(--accent)' },
    { icon: <FiBell />, label: 'Notifications', link: '/notifications', color: 'var(--warning)' },
  ];

  const recommendedServices = [
    { name: 'Keratin Treatment', desc: 'Smooth, frizz-free hair for 3 months', price: 5000, image: '/images/service-hair-treatment.png', category: 'Hair Treatment' },
    { name: 'Gold Facial', desc: 'Luxurious gold-infused glow', price: 1500, image: '/images/facial.png', category: 'Facial' },
    { name: 'Swedish Massage', desc: 'Full body relaxation therapy', price: 1500, image: '/images/service-massage.png', category: 'Massage' },
  ];

  if (loading) {
    return (
      <div className="page customer-dashboard">
        <div className="container">
          <div className="loading-page"><div className="spinner"></div><p>Loading your dashboard...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page customer-dashboard">
      <div className="container">
        {/* Welcome */}
        <div className="cd-welcome animate-fadeInUp">
          <div>
            <h1 className="cd-title">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'there'}</span>
            </h1>
            <p className="text-muted">Here's a summary of your beauty journey</p>
          </div>
          <Link to="/booking" className="btn btn-primary">
            <FiPlus /> Book Appointment
          </Link>
        </div>

        {/* Stats */}
        <div className="cd-stats animate-fadeInUp stagger-1">
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple"><FiCalendar /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalBookings}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-teal"><FiClock /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.upcomingBookings}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green"><FiStar /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.completedBookings}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-orange"><FiGift /></div>
            <div className="stat-content">
              <span className="stat-value">{stats.loyaltyPoints}</span>
              <span className="stat-label">Loyalty Points</span>
            </div>
          </div>
        </div>

        <div className="cd-main-grid">
          {/* Next Appointment */}
          <div className="cd-next-appointment card animate-fadeInUp stagger-2">
            <h2 className="cd-section-title"><FiCalendar /> Next Appointment</h2>
            {nextBooking ? (
              <div className="next-apt-content">
                <div className="next-apt-countdown">
                  <span className="next-apt-when">{getTimeUntil(nextBooking.date)}</span>
                </div>
                <div className="next-apt-details">
                  <div className="next-apt-date">{formatDate(nextBooking.date)}</div>
                  <div className="next-apt-time">
                    <FiClock size={14} /> {nextBooking.timeSlot?.start} — {nextBooking.timeSlot?.end}
                  </div>
                  <div className="next-apt-services">
                    {(nextBooking.services || []).map((s, i) => (
                      <span key={i} className="spec-tag">{s.name}</span>
                    ))}
                  </div>
                  {nextBooking.staff?.userId?.name && (
                    <div className="next-apt-staff">
                      <FiScissors size={14} /> {nextBooking.staff.userId.name}
                    </div>
                  )}
                </div>
                <Link to="/my-bookings" className="btn btn-outline btn-sm">
                  View Details <FiArrowRight />
                </Link>
              </div>
            ) : (
              <div className="card-empty">
                <FiCalendar size={32} style={{ color: 'var(--primary)' }} />
                <p>No upcoming appointments</p>
                <Link to="/booking" className="btn btn-primary btn-sm">Book Now</Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="cd-quick-actions animate-fadeInUp stagger-3">
            <h2 className="cd-section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action, i) => (
                <Link key={i} to={action.link} className="quick-action-card card">
                  <div className="quick-action-icon" style={{ color: action.color }}>{action.icon}</div>
                  <span className="quick-action-label">{action.label}</span>
                  <FiArrowRight size={14} className="quick-action-arrow" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Services */}
        <div className="cd-recommended animate-fadeInUp stagger-4">
          <h2 className="cd-section-title"><FiHeart /> Recommended For You</h2>
          <div className="recommended-grid">
            {recommendedServices.map((service, i) => (
              <div key={i} className="recommended-card card">
                <div className="recommended-img">
                  <img
                    src={service.image}
                    alt={service.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.background = 'linear-gradient(135deg, var(--primary-glow), var(--bg-tertiary))';
                      e.target.parentElement.style.display = 'flex';
                      e.target.parentElement.style.alignItems = 'center';
                      e.target.parentElement.style.justifyContent = 'center';
                    }}
                  />
                </div>
                <div className="recommended-info">
                  <h4>{service.name}</h4>
                  <p>{service.desc}</p>
                </div>
                <div className="recommended-right">
                  <span className="recommended-price">₹{service.price.toLocaleString()}</span>
                  <Link to="/booking" className="btn btn-ghost btn-sm">Book <FiArrowRight /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <div className="cd-recent animate-fadeInUp stagger-5">
            <div className="card-header-row">
              <h2 className="cd-section-title"><FiTrendingUp /> Recent Activity</h2>
              <Link to="/my-bookings" className="btn btn-ghost btn-sm">View All <FiArrowRight /></Link>
            </div>
            <div className="recent-list">
              {recentBookings.map((booking, i) => (
                <div key={booking._id || i} className="recent-item">
                  <div className="recent-date-badge">
                    <span className="recent-month">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="recent-day">{new Date(booking.date).getDate()}</span>
                  </div>
                  <div className="recent-info">
                    <span className="recent-services">
                      {(booking.services || []).map(s => s.name).join(', ') || 'Service'}
                    </span>
                    <span className={`badge ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                  </div>
                  {booking.totalAmount && (
                    <span className="recent-amount">₹{booking.totalAmount.toLocaleString()}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
