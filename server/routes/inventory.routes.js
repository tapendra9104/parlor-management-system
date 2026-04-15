const express = require('express');
const router = express.Router();
const { getInventory, createItem, updateItem, restockItem, deleteItem } = require('../controllers/inventory.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getInventory);
router.post('/', protect, authorize('admin'), createItem);
router.put('/:id', protect, authorize('admin'), updateItem);
router.put('/:id/restock', protect, authorize('admin'), restockItem);
router.delete('/:id', protect, authorize('admin'), deleteItem);

module.exports = router;
