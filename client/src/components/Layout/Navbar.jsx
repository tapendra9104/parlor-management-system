import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiMenu, FiX, FiSun, FiMoon, FiBell, FiUser, FiLogOut,
  FiChevronDown, FiGrid, FiCalendar, FiSettings, FiUsers,
  FiPackage, FiScissors
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Detect scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Check if we're on the home page (for transparent navbar)
  const isHomePage = location.pathname === '/';

  // Role-based navigation links
  const getNavLinks = () => {
    const links = [];

    if (!user) {
      links.push({ path: '/services', label: 'Services' });
      links.push({ path: '/booking', label: 'Book Now' });
    } else if (user.role === 'customer') {
      links.push({ path: '/services', label: 'Services' });
      links.push({ path: '/booking', label: 'Book Now' });
    } else if (user.role === 'admin') {
      links.push({ path: '/admin/dashboard', label: 'Dashboard' });
      links.push({ path: '/admin/services', label: 'Services' });
      links.push({ path: '/admin/staff', label: 'Staff' });
      links.push({ path: '/admin/inventory', label: 'Inventory' });
    } else if (user.role === 'staff') {
      links.push({ path: '/staff/dashboard', label: 'Dashboard' });
      links.push({ path: '/services', label: 'Services' });
    }

    return links;
  };

  const navLinks = getNavLinks();

  // Dropdown items based on role
  const getDropdownItems = () => {
    const items = [
      { path: '/profile', icon: <FiUser size={16} />, label: 'My Profile' },
    ];

    if (user?.role === 'customer') {
      items.unshift({ path: '/dashboard', icon: <FiGrid size={16} />, label: 'My Dashboard' });
      items.push({ path: '/my-bookings', icon: <FiCalendar size={16} />, label: 'My Bookings' });
      items.push({ path: '/notifications', icon: <FiBell size={16} />, label: 'Notifications' });
    } else if (user?.role === 'admin') {
      items.push({ path: '/admin/dashboard', icon: <FiGrid size={16} />, label: 'Admin Dashboard' });
      items.push({ path: '/admin/services', icon: <FiScissors size={16} />, label: 'Manage Services' });
      items.push({ path: '/admin/staff', icon: <FiUsers size={16} />, label: 'Manage Staff' });
      items.push({ path: '/admin/inventory', icon: <FiPackage size={16} />, label: 'Inventory' });
    } else if (user?.role === 'staff') {
      items.push({ path: '/staff/dashboard', icon: <FiGrid size={16} />, label: 'My Dashboard' });
      items.push({ path: '/notifications', icon: <FiBell size={16} />, label: 'Notifications' });
    }

    return items;
  };

  const getRoleBadgeClass = () => {
    if (user?.role === 'admin') return 'badge-primary';
    if (user?.role === 'staff') return 'badge-info';
    return 'badge-success';
  };

  const getRoleLabel = () => {
    if (user?.role === 'admin') return 'Admin';
    if (user?.role === 'staff') return 'Staff';
    return 'Customer';
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${isHomePage && !scrolled ? 'navbar-transparent' : ''}`} id="main-navbar">
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <div className="logo-mark">
            <FiScissors size={20} />
          </div>
          <span className="logo-text">
            Salon<span className="logo-highlight">Flow</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) || (link.path !== '/' && location.pathname.startsWith(link.path)) ? 'active' : ''} ${link.highlight ? 'nav-link-highlight' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Customer-specific: My Bookings in nav */}
          {user && user.role === 'customer' && (
            <Link
              to="/my-bookings"
              className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              My Bookings
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <button
            className="btn-icon theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            id="theme-toggle-btn"
          >
            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <Link to="/notifications" className="btn-icon notification-btn" id="notification-btn">
                <FiBell size={18} />
                <span className="notification-dot"></span>
              </Link>

              {/* User Dropdown */}
              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  className="user-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  id="user-dropdown-trigger"
                >
                  <div className="avatar avatar-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name hide-mobile">{user.name?.split(' ')[0]}</span>
                  <FiChevronDown size={14} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu animate-fadeIn">
                    <div className="dropdown-header">
                      <p className="dropdown-user-name">{user.name}</p>
                      <p className={`dropdown-user-role badge ${getRoleBadgeClass()}`}>{getRoleLabel()}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    {getDropdownItems().map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm" id="login-btn">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm nav-signup-btn" id="register-btn">Sign Up</Link>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
