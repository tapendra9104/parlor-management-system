/**
 * ============================================
 * SalonFlow — API Service
 * ============================================
 * Centralized HTTP client for all API calls.
 */

const API_BASE = '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    let response;
    try {
      response = await fetch(url, config);
    } catch (networkError) {
      throw new Error('Unable to connect to server. Please make sure the backend is running.');
    }

    // Safely parse JSON — handles empty bodies and non-JSON responses
    let data;
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      throw new Error(
        response.ok
          ? 'Server returned an invalid response.'
          : `Server error (${response.status}). Please try again later.`
      );
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Don't redirect if we're already on the login page
        if (!window.location.pathname.includes('/login')) {
          this.setToken(null);
          window.location.href = '/login';
        }
      }

      // User-friendly error messages for common server errors
      if (!data.message && [500, 502, 503, 504].includes(response.status)) {
        throw new Error('Server is currently unavailable. Please ensure the backend is running and try again.');
      }

      throw new Error(data.message || `Request failed (${response.status})`);
    }

    return data;
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ─── Auth ─────────────────────────────────
  login(credentials) { return this.post('/auth/login', credentials); }
  register(userData) { return this.post('/auth/register', userData); }
  getProfile() { return this.get('/auth/me'); }
  updateProfile(data) { return this.put('/auth/profile', data); }
  changePassword(data) { return this.put('/auth/change-password', data); }
  forgotPassword(email) { return this.post('/auth/forgot-password', { email }); }
  resetPassword(data) { return this.post('/auth/reset-password', data); }
  getUsers(params = '') { return this.get(`/auth/users?${params}`); }

  // ─── Services ─────────────────────────────
  getServices(params = '') { return this.get(`/services?${params}`); }
  getService(id) { return this.get(`/services/${id}`); }
  createService(data) { return this.post('/services', data); }
  updateService(id, data) { return this.put(`/services/${id}`, data); }
  deleteService(id) { return this.delete(`/services/${id}`); }
  getCategories() { return this.get('/services/categories/list'); }

  // ─── Staff ────────────────────────────────
  getStaff(params = '') { return this.get(`/staff?${params}`); }
  getStaffMember(id) { return this.get(`/staff/${id}`); }
  createStaff(data) { return this.post('/staff', data); }
  updateStaff(id, data) { return this.put(`/staff/${id}`, data); }
  getStaffAvailability(id, date) { return this.get(`/staff/${id}/availability?date=${date}`); }
  deleteStaff(id) { return this.delete(`/staff/${id}`); }

  // ─── Appointments ─────────────────────────
  getAppointments(params = '') { return this.get(`/appointments?${params}`); }
  createAppointment(data) { return this.post('/appointments', data); }
  updateAppointmentStatus(id, data) { return this.put(`/appointments/${id}/status`, data); }
  cancelAppointment(id, reason) { return this.put(`/appointments/${id}/cancel`, { reason }); }
  getAvailableSlots(staffId, date, duration) { return this.get(`/appointments/slots?staffId=${staffId}&date=${date}&duration=${duration}`); }

  // ─── Reviews ──────────────────────────────
  createReview(data) { return this.post('/reviews', data); }
  getStaffReviews(staffId) { return this.get(`/reviews/staff/${staffId}`); }

  // ─── Inventory ────────────────────────────
  getInventory(params = '') { return this.get(`/inventory?${params}`); }
  createInventoryItem(data) { return this.post('/inventory', data); }
  updateInventoryItem(id, data) { return this.put(`/inventory/${id}`, data); }
  restockItem(id, quantity) { return this.put(`/inventory/${id}/restock`, { quantity }); }
  deleteInventoryItem(id) { return this.delete(`/inventory/${id}`); }

  // ─── Payments (Razorpay) ──────────────────
  getRazorpayKey() { return this.get('/payments/razorpay-key'); }
  createRazorpayOrder(data) { return this.post('/payments/create-order', data); }
  verifyRazorpayPayment(data) { return this.post('/payments/verify', data); }
  getPayments() { return this.get('/payments'); }
  getPayment(id) { return this.get(`/payments/${id}`); }

  // ─── Chat ─────────────────────────────────
  sendChatMessage(data) { return this.post('/chat/send', data); }
  getChatHistory() { return this.get('/chat/history'); }
  getChatSession(id) { return this.get(`/chat/session/${id}`); }

  // ─── Notifications ────────────────────────
  getNotifications() { return this.get('/notifications'); }
  markNotificationRead(id) { return this.put(`/notifications/${id}/read`); }
  markAllNotificationsRead() { return this.put('/notifications/read-all'); }

  // ─── Analytics ────────────────────────────
  getDashboardStats() { return this.get('/analytics/dashboard'); }
}

const api = new ApiService();
export default api;
