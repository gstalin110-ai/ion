const express = require('express');
const { body, validationResult } = require('express-validator');
const AIConversation = require('../models/AIConversation');
const AIMessage = require('../models/AIMessage');
const AIPreference = require('../models/AIPreference');
const AIService = require('../services/AIService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await AIConversation.findByUser(req.user.id);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single conversation with messages
router.get('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await AIConversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const messages = await AIMessage.findByConversation(req.params.id);
    res.json({ ...conversation, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new conversation
router.post('/conversations', auth, [
  body('title').optional().trim().isLength({ max: 100 }),
  body('context').optional().isIn(['general', 'marketplace', 'social', 'automation'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const conversationData = {
      ...req.body,
      user_id: req.user.id,
      title: req.body.title || 'Nueva conversación'
    };

    const conversation = await AIConversation.create(conversationData);
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete conversation
router.delete('/conversations/:id', auth, async (req, res) => {
  try {
    const conversation = await AIConversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await AIMessage.deleteByConversation(req.params.id);
    await AIConversation.delete(req.params.id);
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message and get AI response
router.post('/conversations/:id/message', auth, [
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('context').optional().isIn(['general', 'marketplace', 'social', 'automation'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const conversation = await AIConversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const response = await AIService.generateResponse(
      req.params.id,
      req.body.content,
      req.user.id,
      req.body.context || conversation.context
    );

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const preferences = await AIPreference.findByUser(req.user.id);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update preferences
router.put('/preferences', auth, [
  body('voice_type').optional().isIn(['male', 'female']),
  body('voice_speed').optional().isFloat({ min: 0.5, max: 2.0 }),
  body('language').optional().isIn(['es', 'en']),
  body('personality').optional().isIn(['professional', 'friendly', 'casual', 'formal']),
  body('automation_enabled').optional().isBoolean(),
  body('auto_responses').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const preferences = await AIPreference.createOrUpdate(req.user.id, req.body);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Tools
router.post('/tools/product-description', auth, [
  body('title').trim().isLength({ min: 1 }),
  body('category').trim().isLength({ min: 1 }),
  body('price').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const description = await AIService.generateProductDescription(req.body);
    res.json({ description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tools/social-post', auth, [
  body('content').trim().isLength({ min: 1 }),
  body('platform').optional().isIn(['instagram', 'facebook', 'twitter', 'tiktok'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await AIService.generateSocialPost(req.body.content, req.body.platform);
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tools/marketing-copy', auth, [
  body('title').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 1 }),
  body('price').isFloat({ min: 0 }),
  body('goal').optional().isIn(['sales', 'awareness', 'engagement'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const copy = await AIService.generateMarketingCopy(req.body, req.body.goal);
    res.json({ copy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
