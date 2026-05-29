const express = require('express');
const { body, validationResult } = require('express-validator');
const Story = require('../models/Story');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get active stories
router.get('/active', async (req, res) => {
  try {
    const stories = await Story.findActive();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's stories
router.get('/my', auth, async (req, res) => {
  try {
    const stories = await Story.findByUser(req.user.id);
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get story by ID
router.get('/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create story
router.post('/', auth, [
  body('media_url').isURL(),
  body('media_type').isIn(['image', 'video']),
  body('caption').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const story = await Story.create({
      user_id: req.user.id,
      ...req.body
    });

    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete story
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.delete(req.params.id, req.user.id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json({ message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark story as viewed
router.post('/:id/view', auth, async (req, res) => {
  try {
    await Story.markAsViewed(req.params.id, req.user.id);
    res.json({ message: 'Story viewed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get view count
router.get('/:id/views', async (req, res) => {
  try {
    const count = await Story.getViewCount(req.params.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
