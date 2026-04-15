import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiCalendar, FiUsers, FiStar, FiMessageCircle, FiArrowRight, FiCheck, FiScissors, FiDroplet, FiSmile, FiHeart, FiClock, FiAward, FiTrendingUp } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  const services = [
    { icon: <FiScissors />, title: 'Haircut & Styling', desc: 'Expert cuts tailored to your unique style and personality.', price: 'From ₹300', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop' },
    { icon: <FiDroplet />, title: 'Hair Color', desc: 'Premium coloring with international-grade products.', price: 'From ₹1500', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop' },
    { icon: <FiSmile />, title: 'Facial & Skin Care', desc: 'Rejuvenating treatments for naturally glowing skin.', price: 'From ₹500', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop' },
    { icon: <FiHeart />, title: 'Bridal Packages', desc: 'Complete head-to-toe bridal beauty packages.', price: 'From ₹10K', image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop' },
  ];

  const features = [
    { icon: <FiCalendar />, title: 'Smart Booking', desc: 'Book appointments in seconds with real-time availability and AI-powered slot recommendations.' },
    { icon: <FiMessageCircle />, title: 'AI Chatbot', desc: 'Get instant help, personalized suggestions, and seamless bookings via our AI assistant.' },
    { icon: <FiUsers />, title: 'Expert Stylists', desc: 'Choose from our team of certified, experienced beauty professionals with verified reviews.' },
    { icon: <FiStar />, title: 'Premium Quality', desc: 'International-grade products and services with a 100% satisfaction guarantee.' },
  ];

  const testimonials = [
    { name: 'Priya M.', text: 'The AI booking assistant is amazing! Got my appointment in seconds. The whole experience feels so premium.', rating: 5, role: 'Regular Client' },
    { name: 'Rahul S.', text: 'Best salon experience in the city. The stylists are extremely professional and attentive.', rating: 5, role: 'Monthly Member' },
    { name: 'Anjali K.', text: 'Love the bridal package! Made my special day even more beautiful. Highly recommended for brides!', rating: 5, role: 'Bridal Client' },
  ];

  return (
    <div className="home-page">
      {/* ─── Hero Section ─────────────────────────── */}
      <section className="hero" id="hero-section">
        <div className="hero-bg-image">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Salon Interior" 
            className="hero-bg-photo"
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            Look Your Best,<br />Feel Your Best
          </h1>
          <p className="hero-subtitle">
            Premium salon services tailored to your unique style.<br />
            Book your appointment in seconds.
          </p>
          <div className="hero-actions">
            {!user ? (
              <>
                <Link to="/services" className="btn btn-primary btn-lg hero-btn" id="hero-services-btn">
                  Browse Services
                </Link>
                <Link to="/booking" className="btn btn-outline-white btn-lg hero-btn" id="hero-book-btn">
                  Book Now
                </Link>
              </>
            ) : user.role === 'admin' ? (
              <>
                <Link to="/admin/dashboard" className="btn btn-primary btn-lg hero-btn">
                  Go to Dashboard
                </Link>
                <Link to="/admin/services" className="btn btn-outline-white btn-lg hero-btn">
                  Manage Services
                </Link>
              </>
            ) : user.role === 'staff' ? (
              <>
                <Link to="/staff/dashboard" className="btn btn-primary btn-lg hero-btn">
                  My Dashboard
                </Link>
                <Link to="/services" className="btn btn-outline-white btn-lg hero-btn">
                  View Services
                </Link>
              </>
            ) : (
              <>
                <Link to="/booking" className="btn btn-primary btn-lg hero-btn" id="hero-book-btn">
                  Book Appointment
                </Link>
                <Link to="/my-bookings" className="btn btn-outline-white btn-lg hero-btn">
                  My Bookings
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─────────────────────────── */}
      <section className="stats-section" id="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-block">
              <div className="stat-block-header">
                <span className="stat-block-label">Happy Clients</span>
                <span className="stat-block-icon"><FiSmile size={20} /></span>
              </div>
              <div className="stat-block-value">1,200+</div>
              <div className="stat-block-sub">98% satisfaction rate</div>
            </div>
            <div className="stat-block">
              <div className="stat-block-header">
                <span className="stat-block-label">Appointments This Month</span>
                <span className="stat-block-icon"><FiCalendar size={20} /></span>
              </div>
              <div className="stat-block-value">+350</div>
              <div className="stat-block-sub">20% increase from last month</div>
            </div>
            <div className="stat-block">
              <div className="stat-block-header">
                <span className="stat-block-label">Services Offered</span>
                <span className="stat-block-icon"><FiScissors size={20} /></span>
              </div>
              <div className="stat-block-value">50+</div>
              <div className="stat-block-sub">Hair, Skin, Nails, and More</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services Preview ──────────────────────── */}
      <section className="section services-preview" id="services-preview">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Our Services</span>
            <h2 className="section-title">Discover Our Premium Services</h2>
            <p className="section-subtitle">From classic cuts to luxury bridal packages, we offer everything you need.</p>
          </div>

          <div className="services-grid grid-4">
            {services.map((service, i) => (
              <div key={i} className={`service-preview-card animate-fadeInUp stagger-${i + 1}`}>
                <div className="service-preview-image">
                  <img src={service.image} alt={service.title} loading="lazy" />
                  <div className="service-preview-price">{service.price}</div>
                </div>
                <div className="service-preview-body">
                  <div className="service-icon-wrapper">
                    {service.icon}
                  </div>
                  <h3 className="service-name">{service.title}</h3>
                  <p className="service-desc">{service.desc}</p>
                  <Link to="/services" className="service-link">
                    Learn More <FiArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─────────────────────── */}
      <section className="section features-section" id="features-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">The SalonFlow Advantage</h2>
          </div>

          <div className="features-grid grid-2">
            {features.map((feature, i) => (
              <div key={i} className="feature-card animate-fadeInUp">
                <div className="feature-icon">{feature.icon}</div>
                <div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-desc">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────── */}
      <section className="section testimonials-section" id="testimonials-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Testimonials</span>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>

          <div className="testimonials-grid grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card card animate-fadeInUp">
                <div className="testimonial-stars">
                  {[...Array(t.rating)].map((_, j) => (
                    <FiStar key={j} className="star-filled" />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="avatar avatar-sm">{t.name.charAt(0)}</div>
                  <div>
                    <span className="author-name">{t.name}</span>
                    <span className="author-role">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────── */}
      <section className="section cta-section" id="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-title">
              {user ? 'Ready for Your Next Visit?' : 'Ready to Transform Your Look?'}
            </h2>
            <p className="cta-text">
              {user
                ? 'Book your next appointment and let our AI assistant find the perfect service for you.'
                : 'Join SalonFlow today and experience premium beauty services at their finest.'}
            </p>
            <div className="cta-actions">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started Free <FiArrowRight />
                  </Link>
                  <Link to="/services" className="btn btn-outline-white btn-lg">
                    Explore Services
                  </Link>
                </>
              ) : user.role === 'customer' ? (
                <Link to="/booking" className="btn btn-primary btn-lg">
                  Book Appointment <FiArrowRight />
                </Link>
              ) : (
                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} className="btn btn-primary btn-lg">
                  Go to Dashboard <FiArrowRight />
                </Link>
              )}
            </div>
            <div className="cta-features">
              <span className="cta-feature"><FiCheck /> Free Cancellation</span>
              <span className="cta-feature"><FiCheck /> AI Recommendations</span>
              <span className="cta-feature"><FiCheck /> Premium Products</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
