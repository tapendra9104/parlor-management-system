const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, getSession } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth');

router.post('/send', protect, sendMessage);
router.get('/history', protect, getChatHistory);
router.get('/session/:id', protect, getSession);

module.exports = router;
