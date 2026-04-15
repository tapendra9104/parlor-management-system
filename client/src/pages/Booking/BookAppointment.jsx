import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FiChevronRight, FiChevronLeft, FiCheck, FiClock,
  FiUser, FiCalendar, FiCreditCard, FiShield, FiStar,
  FiScissors, FiDroplet, FiHeart, FiSmile, FiSun,
  FiFeather, FiHome
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Booking.css';

const STEPS = ['Services', 'Stylist', 'Date & Time', 'Review', 'Payment'];

// Gap #8: Demo mode flag
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

// Demo fallback data (only used when DEMO_MODE=true)
const DEMO_BOOKING_SERVICES = [
  { _id: 'd1', name: 'Classic Haircut', category: 'Haircut', duration: 45, price: 500, description: 'Precision cut with wash & styling' },
  { _id: 'd2', name: 'Premium Haircut & Styling', category: 'Haircut', duration: 60, price: 1200, description: 'Designer cut with premium products' },
  { _id: 'd3', name: 'Global Hair Color', category: 'Hair Color', duration: 120, price: 3500, description: 'Full head color transformation' },
  { _id: 'd4', name: 'Highlights & Balayage', category: 'Hair Color', duration: 150, price: 4500, description: 'Hand-painted highlights for natural look' },
  { _id: 'd5', name: 'Keratin Treatment', category: 'Hair Treatment', duration: 180, price: 5000, description: 'Smooth & frizz-free for 3 months' },
  { _id: 'd6', name: 'Hair Spa', category: 'Hair Treatment', duration: 60, price: 1200, description: 'Deep conditioning & scalp therapy' },
  { _id: 'd7', name: 'Gold Facial', category: 'Facial', duration: 60, price: 1500, description: 'Anti-aging gold infused facial' },
  { _id: 'd8', name: 'Classic Manicure', category: 'Manicure', duration: 30, price: 400, description: 'Nail shaping, cuticle care & polish' },
  { _id: 'd9', name: 'Swedish Massage', category: 'Massage', duration: 60, price: 1500, description: 'Full body relaxation massage' },
];

const DEMO_STAFF = [
  { _id: 's1', userId: { name: 'Riya Sharma', email: 'riya@salonflow.com' }, specializations: ['Haircut', 'Hair Color', 'Bridal'], isAvailable: true, rating: { average: 4.8, count: 120 }, experience: 5 },
  { _id: 's2', userId: { name: 'Amit Patel', email: 'amit@salonflow.com' }, specializations: ['Facial', 'Skin Care', 'Massage'], isAvailable: true, rating: { average: 4.6, count: 95 }, experience: 3 },
  { _id: 's3', userId: { name: 'Priya Singh', email: 'priya@salonflow.com' }, specializations: ['Manicure', 'Pedicure', 'Waxing'], isAvailable: true, rating: { average: 4.9, count: 142 }, experience: 7 },
];

// React icon components for each category (no emojis)
const categoryIconComponents = {
  'Haircut': <FiScissors size={14} />,
  'Hair Color': <FiDroplet size={14} />,
  'Hair Treatment': <FiHeart size={14} />,
  'Facial': <FiSmile size={14} />,
  'Skin Care': <FiSun size={14} />,
  'Manicure': <FiFeather size={14} />,
  'Pedicure': <FiFeather size={14} />,
  'Makeup': <FiStar size={14} />,
  'Waxing': <FiSun size={14} />,
  'Massage': <FiHeart size={14} />,
  'Bridal': <FiStar size={14} />,
  'Other': <FiStar size={14} />,
  'All': <FiHome size={14} />,
};

// Service images — matching the Services page
const categoryImages = {
  'Haircut': '/images/haircut.png',
  'Hair Color': '/images/hair-color.png',
  'Hair Treatment': '/images/service-hair-treatment.png',
  'Facial': '/images/facial.png',
  'Skin Care': '/images/service-skincare.png',
  'Manicure': '/images/service-manicure.png',
  'Pedicure': '/images/service-pedicure.png',
  'Makeup': '/images/service-makeup.png',
  'Waxing': '/images/service-skincare.png',
  'Massage': '/images/service-massage.png',
  'Bridal': '/images/bridal.png',
  'Other': '/images/haircut.png',
};

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Booking State
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [createdAppointment, setCreatedAppointment] = useState(null);

  // Load services on mount
  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await api.getServices();
      const data = res.data || [];
      setServices(data.length > 0 ? data : DEMO_BOOKING_SERVICES);
    } catch (err) {
      setServices(DEMO_BOOKING_SERVICES);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.getStaff();
      const data = res.data || [];
      setStaffList(data.length > 0 ? data : DEMO_STAFF);
    } catch (err) {
      setStaffList(DEMO_STAFF);
    }
  };

  const fetchSlots = useCallback(async () => {
    if (!selectedStaff || !selectedDate) return;
    setLoading(true);
    try {
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
      const res = await api.getAvailableSlots(selectedStaff._id, selectedDate, totalDuration);
      setSlots(res.data.slots || []);
    } catch (err) {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [selectedStaff, selectedDate, selectedServices]);

  useEffect(() => { if (step === 1) fetchStaff(); }, [step]);
  useEffect(() => { if (selectedStaff && selectedDate) fetchSlots(); }, [selectedStaff, selectedDate, fetchSlots]);

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.find(s => s._id === service._id)
        ? prev.filter(s => s._id !== service._id)
        : [...prev, service]
    );
  };

  const isServiceSelected = (serviceId) => selectedServices.some(s => s._id === serviceId);

  const canProceed = () => {
    switch (step) {
      case 0: return selectedServices.length > 0;
      case 1: return selectedStaff !== null;
      case 2: return selectedSlot !== null && selectedDate;
      case 3: return true; // Review step
      default: return true;
    }
  };

  // Step 4: Create appointment then go to Payment
  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      const res = await api.createAppointment({
        staff: selectedStaff._id,
        services: selectedServices.map(s => s._id),
        date: selectedDate,
        timeSlot: { start: selectedSlot.start },
        notes,
        bookedVia: 'web',
      });
      setCreatedAppointment(res.data);
      setStep(4); // Go to payment step
    } catch (err) {
      toast.error(err.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Initiate Razorpay payment
  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      // 1. Load Razorpay Checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay SDK. Check your internet connection.');
        setPaymentLoading(false);
        return;
      }

      // 2. Create Razorpay order
      const keyRes = await api.getRazorpayKey();
      const orderRes = await api.createRazorpayOrder({
        appointmentId: createdAppointment._id,
      });

      const { orderId, amount, currency } = orderRes.data;

      // 3. Open Razorpay checkout popup
      const options = {
        key: keyRes.data.key,
        amount: amount,
        currency: currency,
        name: 'SalonFlow',
        description: `Appointment - ${selectedServices.map(s => s.name).join(', ')}`,
        order_id: orderId,
        handler: async function (response) {
          // 4. Verify payment on server
          try {
            await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('🎉 Payment successful! Appointment confirmed.');
            navigate('/my-bookings');
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#6C63FF',
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            toast('Payment cancelled. You can pay later from My Bookings.', { icon: 'ℹ️' });
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Pay later — skip payment
  const handlePayLater = () => {
    toast.success('🎉 Appointment booked! You can pay at the salon.');
    navigate('/my-bookings');
  };

  // Generate next 14 days for date selection
  const getDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        value: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return dates;
  };

  const categories = ['All', ...new Set(services.map(s => s.category).filter(Boolean))];
  const filteredServices = activeCategory === 'All' ? services : services.filter(s => s.category === activeCategory);

  return (
    <div className="booking-page page">
      <div className="container">
        <div className="booking-header animate-fadeInUp">
          <span className="section-badge">Book Appointment</span>
          <h1 className="page-title">Schedule Your <span className="text-gradient">Visit</span></h1>
        </div>

        {/* ─── Progress Steps ──────────────────────── */}
        <div className="booking-progress animate-fadeInUp stagger-1">
          {STEPS.map((s, i) => (
            <div key={i} className={`progress-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}>
              <div className="step-circle">
                {i < step ? <FiCheck size={16} /> : <span>{i + 1}</span>}
              </div>
              <span className="step-label">{s}</span>
              {i < STEPS.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        <div className="booking-content">

          {/* ═══════════════════════════════════════════
               Step 1: Select Services (Checkbox Cards)
             ═══════════════════════════════════════════ */}
          {step === 0 && (
            <div className="booking-step animate-fadeInUp">
              <h2 className="step-title">What services do you need?</h2>
              <p className="step-subtitle">Select one or more services for your visit</p>

              {/* Category Pills */}
              <div className="category-pills">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {categoryIconComponents[cat] || <FiStar size={14} />} {cat}
                  </button>
                ))}
              </div>

              {/* Service Cards with Checkboxes */}
              <div className="service-select-grid">
                {filteredServices.map(service => {
                  const selected = isServiceSelected(service._id);
                  return (
                    <div
                      key={service._id}
                      className={`service-checkbox-card ${selected ? 'selected' : ''}`}
                      onClick={() => toggleService(service)}
                      role="checkbox"
                      aria-checked={selected}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && toggleService(service)}
                    >
                      {/* Checkbox */}
                      <div className="service-checkbox">
                        <div className={`checkbox-box ${selected ? 'checked' : ''}`}>
                          {selected && <FiCheck size={14} />}
                        </div>
                      </div>

                      {/* Service Image */}
                      <div className="service-card-img">
                        <img
                          src={categoryImages[service.category] || categoryImages['Other']}
                          alt={service.name}
                          loading="lazy"
                        />
                      </div>

                      {/* Service Info */}
                      <div className="service-card-body">
                        <h3 className="service-card-name">{service.name}</h3>
                        {service.description && (
                          <p className="service-card-desc">{service.description}</p>
                        )}
                        <div className="service-card-footer">
                          <span className="service-card-duration"><FiClock size={12} /> {service.duration} min</span>
                          <span className="service-card-price">₹{service.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sticky Summary Bar */}
              {selectedServices.length > 0 && (
                <div className="booking-summary-bar">
                  <div className="summary-bar-left">
                    <span className="summary-bar-count">{selectedServices.length}</span>
                    <span>service{selectedServices.length > 1 ? 's' : ''} selected</span>
                    <span className="summary-bar-divider">•</span>
                    <span><FiClock size={14} /> {totalDuration} min</span>
                  </div>
                  <div className="summary-bar-right">
                    <span className="summary-bar-total">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════
               Step 2: Choose Stylist
             ═══════════════════════════════════════════ */}
          {step === 1 && (
            <div className="booking-step animate-fadeInUp">
              <h2 className="step-title">Choose your stylist</h2>
              <p className="step-subtitle">Pick your preferred beauty professional</p>

              <div className="staff-select-grid">
                {staffList.map(staff => (
                  <div
                    key={staff._id}
                    className={`staff-select-card ${selectedStaff?._id === staff._id ? 'selected' : ''}`}
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <div className="staff-card-top">
                      <div className="avatar avatar-lg">
                        {staff.userId?.name?.charAt(0) || 'S'}
                      </div>
                      {selectedStaff?._id === staff._id && (
                        <div className="staff-selected-indicator"><FiCheck size={16} /></div>
                      )}
                    </div>
                    <h3 className="staff-card-title">{staff.userId?.name || 'Staff'}</h3>
                    <div className="staff-rating">
                      <FiStar size={14} fill="var(--warning)" stroke="var(--warning)" />
                      <span>{staff.rating?.average?.toFixed(1) || '0.0'}</span>
                      <span className="text-muted">({staff.rating?.count || 0})</span>
                    </div>
                    <div className="staff-specs">
                      {staff.specializations?.slice(0, 3).map((s, i) => (
                        <span key={i} className="badge badge-primary">{s}</span>
                      ))}
                    </div>
                    <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>
                      {staff.experience || 0} yrs experience
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
               Step 3: Pick Date & Time
             ═══════════════════════════════════════════ */}
          {step === 2 && (
            <div className="booking-step animate-fadeInUp">
              <h2 className="step-title">Pick a date & time</h2>
              <p className="step-subtitle">Choose your preferred appointment slot</p>

              {/* Date Selector - Horizontal Scroll */}
              <div className="date-selector-wrapper">
                <div className="date-selector">
                  {getDateOptions().map(d => (
                    <button
                      key={d.value}
                      className={`date-card ${selectedDate === d.value ? 'selected' : ''} ${d.isToday ? 'today' : ''}`}
                      onClick={() => { setSelectedDate(d.value); setSelectedSlot(null); }}
                    >
                      <span className="date-day">{d.day}</span>
                      <span className="date-num">{d.date}</span>
                      <span className="date-month">{d.month}</span>
                      {d.isToday && <span className="date-today-badge">Today</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="time-slots-section">
                  <h3 className="slots-title"><FiClock /> Available Time Slots</h3>
                  {loading ? (
                    <div className="loading-page" style={{ minHeight: '200px' }}>
                      <div className="spinner"></div>
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-muted text-center" style={{ padding: '2rem' }}>No slots available for this date</p>
                  ) : (
                    <div className="time-slots-grid">
                      {slots.map((slot, i) => (
                        <button
                          key={i}
                          className={`time-slot-btn ${!slot.available ? 'unavailable' : ''} ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
                          disabled={!slot.available}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════
               Step 4: Review & Confirm
             ═══════════════════════════════════════════ */}
          {step === 3 && (
            <div className="booking-step animate-fadeInUp">
              <h2 className="step-title">Review your booking</h2>
              <p className="step-subtitle">Make sure everything looks good before payment</p>

              <div className="confirm-card glass-card">
                <div className="confirm-section">
                  <h4><FiCalendar /> Date & Time</h4>
                  <p className="confirm-value">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="confirm-value">{selectedSlot?.start} — {selectedSlot?.end}</p>
                </div>

                <div className="confirm-section">
                  <h4><FiUser /> Stylist</h4>
                  <div className="confirm-staff">
                    <div className="avatar avatar-sm">{selectedStaff?.userId?.name?.charAt(0)}</div>
                    <span>{selectedStaff?.userId?.name}</span>
                  </div>
                </div>

                <div className="confirm-section">
                  <h4><FiScissors /> Services</h4>
                  {selectedServices.map(s => (
                    <div key={s._id} className="confirm-service-row">
                      <span>{s.name} <span className="text-muted">({s.duration}min)</span></span>
                      <span className="font-bold">₹{s.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="confirm-total">
                    <span>Total Amount</span>
                    <span className="text-gradient font-bold" style={{ fontSize: '1.5rem' }}>₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="confirm-section">
                  <h4><FiCalendar /> Additional Notes</h4>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Any special requests? (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════
               Step 5: Payment (Razorpay)
             ═══════════════════════════════════════════ */}
          {step === 4 && (
            <div className="booking-step animate-fadeInUp">
              <h2 className="step-title">Complete Payment</h2>
              <p className="step-subtitle">Secure payment powered by Razorpay</p>

              <div className="payment-container">
                <div className="payment-summary-card glass-card">
                  <div className="payment-icon-wrap">
                    <FiCreditCard size={48} />
                  </div>
                  <h3 className="payment-amount">₹{totalPrice.toLocaleString()}</h3>
                  <p className="payment-desc">
                    {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} · {totalDuration} min
                  </p>

                  <div className="payment-details-list">
                    {selectedServices.map(s => (
                      <div key={s._id} className="payment-detail-row">
                        <span>{categoryIconComponents[s.category] || <FiStar size={14} />} {s.name}</span>
                        <span>₹{s.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="payment-secure-badge">
                    <FiShield size={16} />
                    <span>256-bit SSL Secured Payment</span>
                  </div>

                  <div className="payment-actions">
                    <button
                      className="btn btn-primary btn-lg payment-btn"
                      onClick={handlePayment}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <span className="spinner" style={{ width: 20, height: 20 }}></span>
                      ) : (
                        <>
                          <FiCreditCard /> Pay ₹{totalPrice.toLocaleString()} Now
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={handlePayLater}
                      disabled={paymentLoading}
                    >
                      Pay at Salon →
                    </button>
                  </div>

                  <div className="payment-methods-strip">
                    <span className="payment-method-badge"><FiCreditCard size={12} /> Cards</span>
                    <span className="payment-method-badge"><FiSmile size={12} /> UPI</span>
                    <span className="payment-method-badge"><FiHome size={12} /> Net Banking</span>
                    <span className="payment-method-badge"><FiShield size={12} /> Wallets</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Navigation ────────────────────────── */}
          <div className="booking-actions">
            {step > 0 && step < 4 && (
              <button className="btn btn-outline" onClick={() => setStep(step - 1)}>
                <FiChevronLeft /> Back
              </button>
            )}
            <div style={{ flex: 1 }}></div>
            {step < 3 && (
              <button
                className="btn btn-primary"
                disabled={!canProceed()}
                onClick={() => setStep(step + 1)}
              >
                Next <FiChevronRight />
              </button>
            )}
            {step === 3 && (
              <button
                className="btn btn-primary btn-lg"
                disabled={loading}
                onClick={handleProceedToPayment}
              >
                {loading ? (
                  <span className="spinner" style={{ width: 20, height: 20 }}></span>
                ) : (
                  <>Proceed to Payment <FiChevronRight /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
