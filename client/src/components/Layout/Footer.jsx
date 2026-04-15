import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiPhone, FiMapPin, FiScissors, FiClock } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();

  // Check if currently open (simple heuristic)
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isOpen = day !== 0 ? (hour >= 9 && hour < 20) : (hour >= 10 && hour < 18);

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-mark">
                <FiScissors size={16} />
              </div>
              <span className="footer-logo-text">
                Salon<span className="footer-logo-highlight">Flow</span>
              </span>
            </Link>
            <p className="footer-desc">
              Premium salon services tailored to your unique style. 
              Book your appointment in seconds with our intelligent platform.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Instagram"><FiInstagram size={18} /></a>
              <a href="#" className="social-link" aria-label="Facebook"><FiFacebook size={18} /></a>
              <a href="#" className="social-link" aria-label="Twitter"><FiTwitter size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <Link to="/services" className="footer-link">Our Services</Link>
            {(!user || user.role === 'customer') && (
              <Link to="/booking" className="footer-link">Book Appointment</Link>
            )}
            {user ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link to="/my-bookings" className="footer-link">My Bookings</Link>
                    <Link to="/profile" className="footer-link">My Profile</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" className="footer-link">Admin Dashboard</Link>
                    <Link to="/admin/staff" className="footer-link">Manage Staff</Link>
                  </>
                )}
                {user.role === 'staff' && (
                  <Link to="/staff/dashboard" className="footer-link">Staff Dashboard</Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="footer-link">Login</Link>
                <Link to="/register" className="footer-link">Sign Up</Link>
              </>
            )}
          </div>

          {/* Working Hours */}
          <div className="footer-section">
            <h4 className="footer-heading">Working Hours</h4>
            <div className="footer-hours">
              <div className="footer-hours-row">
                <span className="footer-hours-day">Monday–Friday</span>
                <span className="footer-hours-time">9 AM – 8 PM</span>
              </div>
              <div className="footer-hours-row">
                <span className="footer-hours-day">Saturday</span>
                <span className="footer-hours-time">9 AM – 8 PM</span>
              </div>
              <div className="footer-hours-row">
                <span className="footer-hours-day">Sunday</span>
                <span className="footer-hours-time">10 AM – 6 PM</span>
              </div>
            </div>
            <div className={`footer-open-badge ${isOpen ? 'is-open' : 'is-closed'}`}>
              <span className="status-dot"></span>
              {isOpen ? 'Open Now' : 'Closed'}
            </div>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="footer-contact">
              <FiMapPin size={16} />
              <span>123 Beauty Lane, Andheri West<br />Mumbai - 400058</span>
            </div>
            <div className="footer-contact">
              <FiPhone size={16} />
              <span>+91 98765 43210</span>
            </div>
            <div className="footer-contact">
              <FiMail size={16} />
              <span>hello@salonflow.com</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SalonFlow. All rights reserved.</p>
          <p className="footer-credit">Crafted with care for beauty professionals</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
