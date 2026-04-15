/**
 * ============================================
 * SalonFlow — Inventory Model
 * ============================================
 * Tracks salon products and supplies with
 * low-stock alerts and supplier info.
 */

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Hair Products', 'Skin Products', 'Tools', 'Consumables', 'Cleaning', 'Other'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    unit: {
      type: String,
      enum: ['pieces', 'bottles', 'packets', 'liters', 'kg', 'boxes'],
      default: 'pieces',
    },
    reorderLevel: {
      type: Number,
      default: 5,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    supplier: {
      name: { type: String, default: '' },
      contact: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    lastRestocked: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Virtual: isLowStock ──────────────────────────────────────
inventorySchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.reorderLevel;
});

// ─── Ensure virtuals are included in JSON ─────────────────────
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

// ─── Index ────────────────────────────────────────────────────
inventorySchema.index({ category: 1 });
inventorySchema.index({ quantity: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
