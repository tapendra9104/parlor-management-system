import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiCalendar, FiClock, FiUser, FiX, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './MyBookings.css';

const statusColors = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  'in-progress': 'badge-primary',
  completed: 'badge-success',
  cancelled: 'badge-danger',
  'no-show': 'badge-danger',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchBookings(); }, [filter]);

  const fetchBookings = async () => {
    try {
      const params = filter ? `status=${filter}` : '';
      const res = await api.getAppointments(params);
      const data = res.data?.data || res.data;
      setBookings(data?.appointments || data || []);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.cancelAppointment(id, 'Cancelled by customer');
      toast.success('Appointment cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.message || 'Cancel failed');
    }
  };

  const filters = ['', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
  const filterLabels = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

  return (
    <div className="bookings-page page">
      <div className="container">
        <div className="bookings-header animate-fadeInUp">
          <div>
            <h1 className="page-title">My <span className="text-gradient">Bookings</span></h1>
            <p className="text-muted">View and manage your appointments</p>
          </div>
          <Link to="/booking" className="btn btn-primary"><FiPlus /> New Booking</Link>
        </div>

        {/* Filters */}
        <div className="booking-filters animate-fadeInUp stagger-1">
          {filters.map((f, i) => (
            <button
              key={f}
              className={`category-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {filterLabels[i]}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3 className="empty-state-title">No bookings found</h3>
            <p className="empty-state-text">You haven't made any appointments yet.</p>
            <Link to="/booking" className="btn btn-primary" style={{ marginTop: '1rem' }}>Book Now</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking, i) => (
              <div key={booking._id} className={`booking-card card animate-fadeInUp stagger-${(i % 5) + 1}`}>
                <div className="booking-card-header">
                  <span className={`badge ${statusColors[booking.status]}`}>{booking.status}</span>
                  <span className="booking-date">
                    <FiCalendar size={14} />
                    {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <div className="booking-card-body">
                  <div className="booking-time">
                    <FiClock size={16} />
                    <span>{booking.timeSlot?.start} - {booking.timeSlot?.end}</span>
                    <span className="text-muted">({booking.totalDuration} min)</span>
                  </div>

                  <div className="booking-stylist">
                    <FiUser size={16} />
                    <span>{booking.staff?.userId?.name || 'Staff'}</span>
                  </div>

                  <div className="booking-services-list">
                    {booking.services?.map(s => (
                      <span key={s._id} className="booking-service-tag">{s.name}</span>
                    ))}
                  </div>
                </div>

                <div className="booking-card-footer">
                  <span className="booking-amount">₹{booking.totalAmount?.toLocaleString()}</span>
                  {['pending', 'confirmed'].includes(booking.status) && (
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleCancel(booking._id)}>
                      <FiX /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
