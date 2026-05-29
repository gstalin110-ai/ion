const express = require('express');
const { body, validationResult } = require('express-validator');
const Live = require('../models/Live');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get active lives
router.get('/active', async (req, res) => {
  try {
    const lives = await Live.findActive();
    res.json(lives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's lives
router.get('/my', auth, async (req, res) => {
  try {
    const lives = await Live.findByUser(req.user.id);
    res.json(lives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get live by ID
router.get('/:id', async (req, res) => {
  try {
    const live = await Live.findById(req.params.id);
    if (!live) {
      return res.status(404).json({ error: 'Live not found' });
    }
    res.json(live);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create live
router.post('/', auth, [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim(),
  body('stream_url').isURL(),
  body('thumbnail_url').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const live = await Live.create({
      user_id: req.user.id,
      ...req.body
    });

    res.status(201).json(live);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End live
router.put('/:id/end', auth, async (req, res) => {
  try {
    const live = await Live.findById(req.params.id);
    if (!live) {
      return res.status(404).json({ error: 'Live not found' });
    }

    if (live.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await Live.updateStatus(req.params.id, 'ended');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join live (add viewer)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const live = await Live.findById(req.params.id);
    if (!live) {
      return res.status(404).json({ error: 'Live not found' });
    }

    if (live.status !== 'live') {
      return res.status(400).json({ error: 'Live is not active' });
    }

    await Live.addViewer(req.params.id, req.user.id);
    res.json({ message: 'Joined live' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave live (remove viewer)
router.post('/:id/leave', auth, async (req, res) => {
  try {
    await Live.removeViewer(req.params.id, req.user.id);
    res.json({ message: 'Left live' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
