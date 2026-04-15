import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { FiClock, FiSearch, FiArrowRight, FiStar, FiTrendingUp, FiScissors, FiDroplet, FiHeart, FiSmile, FiSun, FiFeather, FiHome } from 'react-icons/fi';
import './Services.css';

// Service images — all locally generated
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

// Gap #8: Demo mode flag — set VITE_DEMO_MODE=false in production
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

// Demo fallback data when API is unavailable (only used when DEMO_MODE=true)
const DEMO_SERVICES = [
  { _id: 'd1', name: 'Classic Haircut', category: 'Haircut', description: 'Professional haircut with wash, style, and blow dry', duration: 45, price: 500, popularity: 156 },
  { _id: 'd2', name: 'Premium Haircut & Styling', category: 'Haircut', description: 'Premium cut with deep conditioning, styling, and personalized consultation', duration: 60, price: 1200, popularity: 89 },
  { _id: 'd3', name: 'Global Hair Color', category: 'Hair Color', description: 'Full head color with premium ammonia-free products', duration: 120, price: 3500, popularity: 94 },
  { _id: 'd4', name: 'Highlights & Balayage', category: 'Hair Color', description: 'Natural-looking highlights with hand-painted balayage technique', duration: 150, price: 4500, popularity: 78 },
  { _id: 'd5', name: 'Keratin Treatment', category: 'Hair Treatment', description: 'Professional keratin smoothing treatment for frizz-free hair', duration: 180, price: 5000, popularity: 65 },
  { _id: 'd6', name: 'Hair Spa', category: 'Hair Treatment', description: 'Deep conditioning spa treatment with hot oil massage', duration: 60, price: 1200, popularity: 112 },
  { _id: 'd7', name: 'Gold Facial', category: 'Facial', description: 'Luxurious gold-infused facial for radiant glowing skin', duration: 60, price: 1500, popularity: 88 },
  { _id: 'd8', name: 'Anti-Aging Facial', category: 'Facial', description: 'Advanced anti-aging treatment with collagen boost', duration: 75, price: 2000, popularity: 54 },
  { _id: 'd9', name: 'Classic Manicure', category: 'Manicure', description: 'Nail shaping, cuticle care, and polish application', duration: 30, price: 400, popularity: 98 },
  { _id: 'd10', name: 'Spa Pedicure', category: 'Pedicure', description: 'Relaxing foot spa with exfoliation, massage, and polish', duration: 45, price: 600, popularity: 84 },
  { _id: 'd11', name: 'Bridal Makeup', category: 'Makeup', description: 'Complete bridal makeup with HD products and airbrush technique', duration: 120, price: 8000, popularity: 45 },
  { _id: 'd12', name: 'Swedish Massage', category: 'Massage', description: 'Relaxing full-body Swedish massage for stress relief', duration: 60, price: 1500, popularity: 73 },
];

const DEMO_CATEGORIES = ['Haircut', 'Hair Color', 'Hair Treatment', 'Facial', 'Manicure', 'Pedicure', 'Makeup', 'Massage'];

const Services = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchServices(); }, [activeCategory, search]);

  const fetchServices = async () => {
    try {
      let params = '';
      if (activeCategory !== 'All') params += `category=${activeCategory}&`;
      if (search) params += `search=${search}&`;
      const res = await api.getServices(params);
      const data = res.data || [];
      setServices(data.length > 0 ? data : (DEMO_MODE ? DEMO_SERVICES : []));
      try {
        const catRes = await api.getCategories();
        setCategories(['All', ...(catRes.data || (DEMO_MODE ? DEMO_CATEGORIES : []))]);
      } catch {
        setCategories(DEMO_MODE ? ['All', ...DEMO_CATEGORIES] : ['All']);
      }
    } catch (error) {
      // Fallback to demo data
      let filtered = DEMO_SERVICES;
      if (activeCategory !== 'All') {
        filtered = filtered.filter(s => s.category === activeCategory);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
      }
      setServices(filtered);
      setCategories(['All', ...DEMO_CATEGORIES]);
    } finally {
      setLoading(false);
    }
  };

  const canBook = !user || user.role === 'customer';

  return (
    <div className="services-page page">
      <div className="container">
        <div className="page-header animate-fadeInUp">
          <span className="section-badge">Our Services</span>
          <h1 className="page-title">Premium Salon <span className="text-gradient">Services</span></h1>
          <p className="page-subtitle">Explore our range of professional beauty and grooming services</p>
        </div>

        <div className="services-toolbar animate-fadeInUp stagger-1">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input type="text" className="search-input" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} id="service-search" />
          </div>
        </div>

        <div className="category-pills animate-fadeInUp stagger-2">
          {categories.map((cat) => (
            <button key={cat} className={`category-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              <span>{categoryIconComponents[cat] || <FiStar size={14} />}</span> {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"></div><p>Loading services...</p></div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FiSearch size={48} /></div>
            <h3 className="empty-state-title">No services found</h3>
            <p className="empty-state-text">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="services-grid-page grid-3">
            {services.map((service, i) => (
              <div key={service._id} className={`service-card card animate-fadeInUp stagger-${(i % 5) + 1}`}>
                <div className="service-card-image">
                  <img src={categoryImages[service.category] || categoryImages['Other']} alt={service.name} loading="lazy" />
                  <div className="service-card-overlay"></div>
                  <div className="service-card-image-badge">
                    <span className="badge badge-primary">{categoryIconComponents[service.category]} {service.category}</span>
                  </div>
                  {service.popularity > 80 && (
                    <div className="service-popular-badge">
                      <FiTrendingUp size={12} /> Popular
                    </div>
                  )}
                </div>
                <div className="service-card-content">
                  <h3 className="service-card-name">{service.name}</h3>
                  <p className="service-card-desc">{service.description}</p>
                  <div className="service-card-meta">
                    <span className="service-duration"><FiClock size={14} /> {service.duration} min</span>
                    <span className="service-price">₹{service.price.toLocaleString()}</span>
                  </div>
                  {canBook && (
                    <Link to="/booking" className="btn btn-primary service-book-btn">
                      Book Now <FiArrowRight size={16} />
                    </Link>
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

export default Services;
