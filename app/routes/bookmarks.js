const express = require('express');
const { body, validationResult } = require('express-validator');
const Bookmark = require('../models/Bookmark');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's bookmarks
router.get('/', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.findByUser(req.user.id);
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create bookmark
router.post('/', auth, [
  body('item_type').isIn(['product', 'post', 'live', 'story']),
  body('item_id').isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bookmark = await Bookmark.create({
      user_id: req.user.id,
      ...req.body
    });

    res.status(201).json(bookmark);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bookmark
router.delete('/:item_type/:item_id', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.delete(
      req.user.id,
      req.params.item_type,
      req.params.item_id
    );
    
    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if bookmark exists
router.get('/check/:item_type/:item_id', auth, async (req, res) => {
  try {
    const exists = await Bookmark.checkExists(
      req.user.id,
      req.params.item_type,
      req.params.item_id
    );
    res.json({ exists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
