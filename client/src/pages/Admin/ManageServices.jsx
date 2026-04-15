import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ManageServices.css';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', category: 'Haircut', description: '', duration: 30, price: 0,
  });

  const categories = ['Haircut', 'Hair Color', 'Hair Treatment', 'Facial', 'Skin Care', 'Manicure', 'Pedicure', 'Makeup', 'Waxing', 'Massage', 'Bridal', 'Other'];

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await api.getServices();
      setServices(res.data || []);
    } catch { toast.error('Failed to load services'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateService(editing._id, formData);
        toast.success('Service updated!');
      } else {
        await api.createService(formData);
        toast.success('Service created!');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchServices();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleEdit = (service) => {
    setEditing(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      price: service.price,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.deleteService(id);
      toast.success('Service deleted');
      fetchServices();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Haircut', description: '', duration: 30, price: 0 });
  };

  const categoryIcons = {
    'Haircut': '✂️', 'Hair Color': '🎨', 'Hair Treatment': '💆‍♀️',
    'Facial': '🧖‍♀️', 'Skin Care': '✨', 'Manicure': '💅',
    'Pedicure': '🦶', 'Makeup': '💄', 'Waxing': '🪒',
    'Massage': '💆', 'Bridal': '👰', 'Other': '🌟',
  };

  return (
    <div className="manage-services page">
      <div className="container">
        <div className="manage-header animate-fadeInUp">
          <div>
            <h1 className="page-title">Manage <span className="text-gradient">Services</span></h1>
            <p className="text-muted">{services.length} services total</p>
          </div>
          <button className="btn btn-primary" onClick={() => { resetForm(); setEditing(null); setShowModal(true); }}>
            <FiPlus /> Add Service
          </button>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner"></div></div>
        ) : (
          <div className="table-container animate-fadeInUp stagger-1">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Popularity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service._id}>
                    <td>
                      <div className="flex items-center gap-sm">
                        <span style={{ fontSize: '20px' }}>{categoryIcons[service.category]}</span>
                        <div>
                          <span className="font-semibold">{service.name}</span>
                          <br />
                          <span className="text-sm text-muted">{service.description?.substring(0, 50)}...</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-primary">{service.category}</span></td>
                    <td>{service.duration} min</td>
                    <td className="font-bold">₹{service.price?.toLocaleString()}</td>
                    <td>{service.popularity} bookings</td>
                    <td>
                      <div className="flex gap-sm">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(service)}><FiEdit2 /></button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(service._id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{editing ? 'Edit Service' : 'Add New Service'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><FiX /></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Premium Haircut" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    {categories.map(c => <option key={c} value={c}>{categoryIcons[c]} {c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required placeholder="Describe the service..." rows={3} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Duration (mins)</label>
                    <input type="number" className="form-input" value={formData.duration} onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })} min={15} max={480} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input type="number" className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} min={0} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  <FiCheck /> {editing ? 'Update Service' : 'Create Service'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageServices;
