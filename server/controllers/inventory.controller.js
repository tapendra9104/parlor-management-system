/**
 * SalonFlow — Inventory Controller
 */
const Inventory = require('../models/Inventory');

const getInventory = async (req, res, next) => {
  try {
    const { category, lowStock, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = { isActive: true };
    if (category) query.category = category;

    const total = await Inventory.countDocuments(query);
    let items = await Inventory.find(query).sort({ name: 1 }).skip(skip).limit(limitNum);
    
    if (lowStock === 'true') {
      items = items.filter(item => item.isLowStock);
    }

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) { next(error); }
};

const createItem = async (req, res, next) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, message: 'Item added', data: item });
  } catch (error) { next(error); }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.status(200).json({ success: true, message: 'Item updated', data: item });
  } catch (error) { next(error); }
};

const restockItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.quantity += quantity;
    item.lastRestocked = new Date();
    await item.save();
    res.status(200).json({ success: true, message: 'Item restocked', data: item });
  } catch (error) { next(error); }
};

const deleteItem = async (req, res, next) => {
  try {
    await Inventory.findByIdAndUpdate(req.params.id, { isActive: false });
    res.status(200).json({ success: true, message: 'Item removed' });
  } catch (error) { next(error); }
};

module.exports = { getInventory, createItem, updateItem, restockItem, deleteItem };
