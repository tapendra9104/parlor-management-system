/**
 * ============================================
 * SalonFlow — Inventory Management (Admin)
 * ============================================
 * Full inventory CRUD with restock alerts,
 * category filtering, and stock management.
 */

import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  FiPackage, FiPlus, FiEdit2, FiTrash2, FiSearch,
  FiAlertTriangle, FiRefreshCw, FiX, FiSave,
  FiBox, FiDollarSign, FiTruck, FiFilter
} from 'react-icons/fi';
import './ManageInventory.css';

const ManageInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Hair Products',
    quantity: 0,
    unit: 'pieces',
    reorderLevel: 5,
    costPrice: 0,
    sellingPrice: 0,
    supplier: { name: '', contact: '' },
  });

  const [editingId, setEditingId] = useState(null);

  const categories = ['Hair Products', 'Skin Products', 'Consumables', 'Tools', 'Other'];
  const units = ['pieces', 'bottles', 'packets', 'boxes', 'liters', 'kg'];

  useEffect(() => {
    fetchInventory();
  }, [showLowStock]);

  const fetchInventory = async () => {
    try {
      const params = showLowStock ? 'lowStock=true' : '';
      const res = await api.getInventory(params);
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await api.createInventoryItem(formData);
        toast.success('Item added to inventory!');
      } else {
        await api.updateInventoryItem(editingId, formData);
        toast.success('Item updated!');
      }
      setShowModal(false);
      resetForm();
      fetchInventory();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    if (restockQty <= 0) return toast.error('Enter a valid quantity');
    try {
      await api.restockItem(restockItem._id, restockQty);
      toast.success(`${restockItem.name} restocked with ${restockQty} ${restockItem.unit}!`);
      setShowRestockModal(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.message || 'Restock failed');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from inventory?`)) return;
    try {
      await api.deleteInventoryItem(item._id);
      toast.success('Item removed');
      fetchInventory();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setEditingId(item._id);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      reorderLevel: item.reorderLevel,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice || 0,
      supplier: item.supplier || { name: '', contact: '' },
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setModalMode('add');
    resetForm();
    setShowModal(true);
  };

  const openRestockModal = (item) => {
    setRestockItem(item);
    setRestockQty(0);
    setShowRestockModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Hair Products',
      quantity: 0,
      unit: 'pieces',
      reorderLevel: 5,
      costPrice: 0,
      sellingPrice: 0,
      supplier: { name: '', contact: '' },
    });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = items.filter(item => item.quantity <= item.reorderLevel).length;

  if (loading) {
    return (
      <div className="page inventory-page">
        <div className="container">
          <div className="loading-page">
            <div className="spinner"></div>
            <p>Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page inventory-page">
      <div className="container">
        {/* Header */}
        <div className="inventory-header animate-fadeInUp">
          <div>
            <h1><FiPackage className="header-icon" /> Inventory Management</h1>
            <p className="text-muted">{items.length} items in stock</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <FiPlus /> Add Item
          </button>
        </div>

        {/* Stats Row */}
        <div className="inventory-stats animate-fadeInUp stagger-2">
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple"><FiBox /></div>
            <div>
              <div className="stat-value">{items.length}</div>
              <div className="stat-label">Total Items</div>
            </div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setShowLowStock(!showLowStock)}>
            <div className="stat-icon stat-icon-orange"><FiAlertTriangle /></div>
            <div>
              <div className="stat-value">{lowStockCount}</div>
              <div className="stat-label">Low Stock {showLowStock ? '(Filtered)' : ''}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-teal"><FiDollarSign /></div>
            <div>
              <div className="stat-value">₹{items.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0).toLocaleString()}</div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="inventory-filters animate-fadeInUp stagger-3">
          <div className="search-input-wrap">
            <FiSearch />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="category-filters">
            <button
              className={`filter-chip ${filterCategory === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategory('all')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="table-container animate-fadeInUp stagger-4">
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h2 className="empty-state-title">No items found</h2>
              <p className="empty-state-text">
                {searchQuery ? 'Try a different search term.' : 'Add items to your inventory to get started.'}
              </p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Cost Price</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const isLow = item.quantity <= item.reorderLevel;
                  return (
                    <tr key={item._id}>
                      <td>
                        <div className="item-name-cell">
                          <div className="item-icon"><FiBox /></div>
                          <div>
                            <strong>{item.name}</strong>
                            <small className="text-muted"> ({item.unit})</small>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-primary">{item.category}</span></td>
                      <td>
                        <span className={`stock-qty ${isLow ? 'low' : ''}`}>
                          {item.quantity}
                        </span>
                        <small className="text-muted"> / reorder at {item.reorderLevel}</small>
                      </td>
                      <td>₹{item.costPrice?.toLocaleString()}</td>
                      <td>
                        {item.supplier?.name ? (
                          <div>
                            <div>{item.supplier.name}</div>
                            <small className="text-muted">{item.supplier.contact}</small>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-danger"><FiAlertTriangle size={12} /> Low Stock</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm" title="Restock" onClick={() => openRestockModal(item)}>
                            <FiRefreshCw />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => openEditModal(item)}>
                            <FiEdit2 />
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(item)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {modalMode === 'add' ? 'Add Inventory Item' : 'Edit Item'}
                </h2>
                <button className="btn btn-icon btn-ghost" onClick={() => setShowModal(false)}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., L'Oreal Shampoo 500ml"
                    required
                  />
                </div>
                <div className="form-row-modal">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-input form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select
                      className="form-input form-select"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row-modal">
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reorder Level</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>
                <div className="form-row-modal">
                  <div className="form-group">
                    <label className="form-label">Cost Price (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: parseInt(e.target.value) || 0 })}
                      min={0}
                    />
                  </div>
                </div>
                <div className="form-row-modal">
                  <div className="form-group">
                    <label className="form-label">Supplier Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.supplier.name}
                      onChange={(e) => setFormData({ ...formData, supplier: { ...formData.supplier, name: e.target.value } })}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Supplier Contact</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.supplier.contact}
                      onChange={(e) => setFormData({ ...formData, supplier: { ...formData.supplier, contact: e.target.value } })}
                      placeholder="+91 98765XXXXX"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <FiSave /> {modalMode === 'add' ? 'Add Item' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Restock Modal */}
        {showRestockModal && restockItem && (
          <div className="modal-overlay" onClick={() => setShowRestockModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="modal-header">
                <h2 className="modal-title"><FiRefreshCw /> Restock Item</h2>
                <button className="btn btn-icon btn-ghost" onClick={() => setShowRestockModal(false)}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleRestock}>
                <div className="restock-info">
                  <h3>{restockItem.name}</h3>
                  <p>Current stock: <strong>{restockItem.quantity} {restockItem.unit}</strong></p>
                </div>
                <div className="form-group">
                  <label className="form-label">Add Quantity ({restockItem.unit})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={restockQty}
                    onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                    min={1}
                    autoFocus
                    required
                  />
                </div>
                <div className="restock-preview">
                  New total: <strong>{restockItem.quantity + restockQty} {restockItem.unit}</strong>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowRestockModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    <FiRefreshCw /> Restock
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

export default ManageInventory;
