/**
 * ============================================
 * SalonFlow — Manage Staff (Admin)
 * ============================================
 * Admin interface to view, add, edit, and
 * manage all salon staff members.
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiUsers, FiEdit2, FiTrash2, FiSearch,
  FiStar, FiCalendar, FiAward, FiBriefcase,
  FiChevronDown, FiX, FiSave, FiUserPlus, FiCheck,
  FiMail, FiPhone, FiLock, FiUser
} from 'react-icons/fi';
import './ManageStaff.css';

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    specializations: [],
    bio: '',
    experience: 0,
    isAvailable: true,
  });

  // Add Staff form state
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specializations: [],
    bio: '',
    experience: 0,
  });

  const allSpecializations = [
    'Haircut', 'Hair Color', 'Hair Treatment', 'Facial',
    'Skin Care', 'Massage', 'Makeup', 'Bridal',
    'Manicure', 'Pedicure', 'Waxing'
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.getStaff();
      setStaff(res.data || []);
    } catch (err) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  // ─── Add Staff ─────────────────────────────
  const handleAddStaff = async (e) => {
    e.preventDefault();

    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error('Name, email, and password are required');
      return;
    }

    if (addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setAddLoading(true);
    try {
      await api.createStaff(addForm);
      toast.success('🎉 Staff member added successfully!');
      setShowAddModal(false);
      setAddForm({
        name: '', email: '', password: '', phone: '',
        specializations: [], bio: '', experience: 0,
      });
      fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to add staff member');
    } finally {
      setAddLoading(false);
    }
  };

  const toggleAddSpec = (spec) => {
    setAddForm(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  // ─── Edit Staff ────────────────────────────
  const handleEditClick = (member) => {
    setEditingStaff(member);
    setEditForm({
      specializations: member.specializations || [],
      bio: member.bio || '',
      experience: member.experience || 0,
      isAvailable: member.isAvailable ?? true,
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.updateStaff(editingStaff._id, editForm);
      toast.success('Staff profile updated!');
      setShowEditModal(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate ${name}? This will remove them from the booking system.`)) return;
    try {
      await api.deleteStaff(id);
      toast.success('Staff member deactivated');
      fetchStaff();
    } catch (err) {
      toast.error(err.message || 'Failed to remove staff');
    }
  };

  const toggleSpecialization = (spec) => {
    setEditForm(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const filteredStaff = staff.filter(s => {
    const name = s.userId?.name || '';
    const email = s.userId?.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="page manage-staff-page">
        <div className="container">
          <div className="loading-page">
            <div className="spinner"></div>
            <p>Loading staff...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page manage-staff-page">
      <div className="container">
        {/* Header */}
        <div className="staff-mgmt-header animate-fadeInUp">
          <div>
            <h1><FiUsers className="header-icon" /> Manage Staff</h1>
            <p className="text-muted">{staff.length} staff members</p>
          </div>
          <div className="staff-mgmt-actions">
            <div className="search-input-wrap">
              <FiSearch />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <FiUserPlus /> Add Staff
            </button>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="staff-grid animate-fadeInUp stagger-2">
          {filteredStaff.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon">👥</div>
              <h2 className="empty-state-title">No staff found</h2>
              <p className="empty-state-text">
                {searchQuery ? 'No staff match your search.' : 'No staff members registered yet. Click "Add Staff" to get started!'}
              </p>
              {!searchQuery && (
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                  <FiUserPlus /> Add Your First Staff Member
                </button>
              )}
            </div>
          ) : (
            filteredStaff.map((member, idx) => (
              <div
                key={member._id}
                className="staff-card card"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="staff-card-header">
                  <div className="staff-card-avatar">
                    {getInitials(member.userId?.name)}
                  </div>
                  <div className={`staff-status ${member.isAvailable ? 'available' : 'unavailable'}`}>
                    {member.isAvailable ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                <h3 className="staff-card-name">{member.userId?.name || 'Unknown'}</h3>
                <p className="staff-card-email">{member.userId?.email || ''}</p>

                {member.bio && (
                  <p className="staff-card-bio">{member.bio}</p>
                )}

                <div className="staff-card-stats">
                  <div className="staff-stat">
                    <FiStar className="staff-stat-icon" />
                    <span>{member.rating?.average?.toFixed(1) || 'N/A'}</span>
                    <small>({member.rating?.count || 0})</small>
                  </div>
                  <div className="staff-stat">
                    <FiBriefcase className="staff-stat-icon" />
                    <span>{member.experience || 0} yrs</span>
                  </div>
                  <div className="staff-stat">
                    <FiCalendar className="staff-stat-icon" />
                    <span>{member.completedAppointments || 0}</span>
                  </div>
                </div>

                <div className="staff-card-specs">
                  {(member.specializations || []).slice(0, 4).map(spec => (
                    <span key={spec} className="spec-tag">{spec}</span>
                  ))}
                  {(member.specializations || []).length > 4 && (
                    <span className="spec-tag spec-more">+{member.specializations.length - 4}</span>
                  )}
                </div>

                <div className="staff-card-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(member)}>
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => handleDeleteStaff(member._id, member.userId?.name)}
                  >
                    <FiTrash2 /> Deactivate
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ═══ Add Staff Modal ═══════════════════════ */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title"><FiUserPlus /> Add New Staff Member</h2>
                <button className="btn btn-icon btn-ghost" onClick={() => setShowAddModal(false)}>
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleAddStaff}>
                <div className="form-row-modal">
                  <div className="form-group">
                    <label className="form-label"><FiUser size={14} /> Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addForm.name}
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      placeholder="e.g. Riya Sharma"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiMail size={14} /> Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={addForm.email}
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      placeholder="riya@salonflow.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row-modal">
                  <div className="form-group">
                    <label className="form-label"><FiLock size={14} /> Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><FiPhone size={14} /> Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={addForm.phone}
                      onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="form-row-modal">
                  <div className="form-group">
                    <label className="form-label"><FiBriefcase size={14} /> Experience (years)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={addForm.experience}
                      onChange={(e) => setAddForm({ ...addForm, experience: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={50}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">Bio</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addForm.bio}
                      onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                      placeholder="Brief description..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Specializations</label>
                  <div className="spec-picker">
                    {allSpecializations.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        className={`spec-pick-item ${addForm.specializations.includes(spec) ? 'selected' : ''}`}
                        onClick={() => toggleAddSpec(spec)}
                      >
                        {addForm.specializations.includes(spec) && <FiCheck size={14} />}
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={addLoading}>
                    {addLoading ? (
                      <span className="spinner" style={{ width: 18, height: 18 }}></span>
                    ) : (
                      <><FiUserPlus /> Add Staff Member</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ═══ Edit Modal ════════════════════════════ */}
        {showEditModal && editingStaff && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Edit Staff Profile</h2>
                <button className="btn btn-icon btn-ghost" onClick={() => setShowEditModal(false)}>
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleUpdateStaff}>
                <div className="form-group">
                  <label className="form-label">Staff Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingStaff.userId?.name || ''}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-input form-textarea"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Brief description of the staff member..."
                    rows={3}
                  />
                </div>

                <div className="form-row-modal">
                  <div className="form-group">
                    <label className="form-label">Experience (years)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editForm.experience}
                      onChange={(e) => setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={50}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Availability</label>
                    <select
                      className="form-input form-select"
                      value={editForm.isAvailable ? 'true' : 'false'}
                      onChange={(e) => setEditForm({ ...editForm, isAvailable: e.target.value === 'true' })}
                    >
                      <option value="true">Available</option>
                      <option value="false">Unavailable</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Specializations</label>
                  <div className="spec-picker">
                    {allSpecializations.map(spec => (
                      <button
                        key={spec}
                        type="button"
                        className={`spec-pick-item ${editForm.specializations.includes(spec) ? 'selected' : ''}`}
                        onClick={() => toggleSpecialization(spec)}
                      >
                        {editForm.specializations.includes(spec) && <FiCheck size={14} />}
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <FiSave /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStaff;
