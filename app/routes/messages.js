const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.getConversations(req.user.id);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get conversation with specific user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;
    const messages = await Message.getConversation(
      req.user.id, 
      req.params.userId, 
      limit, 
      offset
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/', auth, [
  body('receiver_id').isInt(),
  body('content').trim().isLength({ min: 1, max: 5000 }),
  body('message_type').optional().isIn(['text', 'image', 'video', 'audio', 'file', 'product', 'location'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const messageData = {
      ...req.body,
      sender_id: req.user.id
    };

    const message = await Message.create(messageData);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark messages as read
router.put('/read/:senderId', auth, async (req, res) => {
  try {
    await Message.markAsRead(req.params.senderId, req.user.id);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await Message.delete(req.params.messageId);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
