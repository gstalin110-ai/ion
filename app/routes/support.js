const express = require('express');
const { body, validationResult } = require('express-validator');
const SupportTicket = require('../models/SupportTicket');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's tickets
router.get('/my', auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.findByUser(req.user.id);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create ticket
router.post('/', auth, [
  body('subject').trim().isLength({ min: 5, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 1000 }),
  body('category').isIn(['general', 'technical', 'billing', 'feature_request', 'bug_report']),
  body('priority').isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await SupportTicket.create({
      user_id: req.user.id,
      ...req.body
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add message to ticket
router.post('/:id/messages', auth, [
  body('message').trim().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const message = await SupportTicket.addMessage(req.params.id, {
      user_id: req.user.id,
      message: req.body.message,
      is_admin: req.user.is_admin || false
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const messages = await SupportTicket.getMessages(req.params.id);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
