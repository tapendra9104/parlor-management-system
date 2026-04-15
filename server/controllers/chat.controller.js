/**
 * SalonFlow — Chat Controller
 */
const ChatSession = require('../models/ChatSession');
const geminiService = require('../services/geminiService');

const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;

    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
    }

    if (!session) {
      session = await ChatSession.create({
        user: req.user._id,
        messages: [],
      });
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Get AI response
    const response = await geminiService.chat(session.messages, message);

    // Add assistant response
    session.messages.push({
      role: 'assistant',
      content: response.content,
      action: response.action ? {
        type: response.action.type,
        data: response.action.data,
      } : { type: 'none', data: null },
      timestamp: new Date(),
    });

    await session.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        response: response.content,
        action: response.action,
      },
    });
  } catch (error) { next(error); }
};

const getChatHistory = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id, isActive: true })
      .sort({ updatedAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, data: sessions });
  } catch (error) { next(error); }
};

const getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.status(200).json({ success: true, data: session });
  } catch (error) { next(error); }
};

module.exports = { sendMessage, getChatHistory, getSession };
