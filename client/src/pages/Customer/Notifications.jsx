/**
 * ============================================
 * SalonFlow — Notifications Page
 * ============================================
 * Full notification center with real-time updates,
 * read/unread management, and category filtering.
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiBell, FiCheck, FiCheckCircle, FiCalendar,
  FiDollarSign, FiStar, FiPackage, FiMessageCircle,
  FiAlertCircle, FiClock, FiTrash2, FiFilter
} from 'react-icons/fi';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      // Silently handle - no notifications yet
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      appointment: <FiCalendar />,
      payment: <FiDollarSign />,
      review: <FiStar />,
      inventory: <FiPackage />,
      chat: <FiMessageCircle />,
      alert: <FiAlertCircle />,
      reminder: <FiClock />,
    };
    return icons[type] || <FiBell />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      appointment: 'notif-purple',
      payment: 'notif-green',
      review: 'notif-yellow',
      inventory: 'notif-orange',
      chat: 'notif-blue',
      alert: 'notif-red',
      reminder: 'notif-teal',
    };
    return colors[type] || 'notif-purple';
  };

  const getTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.isRead)
      : notifications.filter(n => n.type === filter);

  const filters = [
    { id: 'all', label: 'All', icon: <FiBell /> },
    { id: 'unread', label: 'Unread', icon: <FiAlertCircle /> },
    { id: 'appointment', label: 'Appointments', icon: <FiCalendar /> },
    { id: 'payment', label: 'Payments', icon: <FiDollarSign /> },
  ];

  if (loading) {
    return (
      <div className="page notifications-page">
        <div className="container">
          <div className="loading-page">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page notifications-page">
      <div className="container">
        {/* Header */}
        <div className="notifications-header animate-fadeInUp">
          <div className="notifications-header-left">
            <h1>
              <FiBell className="header-icon" />
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} unread</span>
            )}
          </div>
          {notifications.length > 0 && unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleMarkAllAsRead}>
              <FiCheckCircle /> Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="notification-filters animate-fadeInUp stagger-2">
          {filters.map(f => (
            <button
              key={f.id}
              className={`filter-chip ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="notifications-list animate-fadeInUp stagger-3">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <h2 className="empty-state-title">
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h2>
              <p className="empty-state-text">
                {filter === 'unread'
                  ? 'You have no unread notifications.'
                  : 'When you receive notifications about your bookings, payments, or special offers, they will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif, idx) => (
              <div
                key={notif._id || idx}
                className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className={`notification-icon-wrap ${getNotificationColor(notif.type)}`}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notification-body">
                  <h4 className="notification-title">{notif.title || 'Notification'}</h4>
                  <p className="notification-message">{notif.message}</p>
                  <span className="notification-time">
                    <FiClock size={12} />
                    {getTimeAgo(notif.createdAt)}
                  </span>
                </div>
                <div className="notification-actions">
                  {!notif.isRead && (
                    <div className="unread-dot" title="Unread"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
