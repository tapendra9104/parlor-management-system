/**
 * ============================================
 * SalonFlow — Main App Router
 * ============================================
 */

import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n/i18nContext';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ChatWidget from './components/Chatbot/ChatWidget';
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Services from './pages/Services/Services';
import ForgotPassword from './pages/Auth/ForgotPassword';

// Customer Pages
import BookAppointment from './pages/Booking/BookAppointment';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import MyBookings from './pages/Customer/MyBookings';
import Profile from './pages/Customer/Profile';
import Notifications from './pages/Customer/Notifications';

// Staff Pages
import StaffDashboard from './pages/Staff/StaffDashboard';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageServices from './pages/Admin/ManageServices';
import ManageStaff from './pages/Admin/ManageStaff';
import ManageInventory from './pages/Admin/ManageInventory';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppContent = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Customer Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/booking" element={
          <ProtectedRoute roles={['customer']}>
            <BookAppointment />
          </ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['customer']}>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><Notifications /></ProtectedRoute>
        } />

        {/* Staff Routes */}
        <Route path="/staff/dashboard" element={
          <ProtectedRoute roles={['staff', 'admin']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/services" element={
          <ProtectedRoute roles={['admin']}>
            <ManageServices />
          </ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute roles={['admin']}>
            <ManageStaff />
          </ProtectedRoute>
        } />
        <Route path="/admin/inventory" element={
          <ProtectedRoute roles={['admin']}>
            <ManageInventory />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div className="page" style={{ paddingTop: 'calc(var(--navbar-height) + 3rem)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
            <div className="container">
              <div className="empty-state animate-fadeInUp">
                <div className="empty-state-icon" style={{ fontSize: '5rem', lineHeight: 1, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</div>
                <h2 className="empty-state-title" style={{ fontSize: '1.75rem' }}>Page Not Found</h2>
                <p className="empty-state-text" style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>Sorry, the page you're looking for doesn't exist or has been moved.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Link to="/" className="btn btn-primary">← Back to Home</Link>
                  <Link to="/services" className="btn btn-outline">View Services</Link>
                </div>
              </div>
            </div>
          </div>
        } />
      </Routes>
      <Footer />

      {/* AI Chatbot Widget - Always visible */}
      <ChatWidget />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          },
        }}
      />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
