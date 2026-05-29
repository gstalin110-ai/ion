const express = require('express');
const Badge = require('../models/Badge');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's badges
router.get('/', auth, async (req, res) => {
  try {
    const badges = await Badge.findByUser(req.user.id);
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get badge definitions
router.get('/definitions', async (req, res) => {
  try {
    const definitions = await Badge.getBadgeDefinitions();
    res.json(definitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Award badge (admin only)
router.post('/award', auth, async (req, res) => {
  try {
    const { user_id, badge_type, badge_name, badge_description, badge_icon } = req.body;
    
    const badge = await Badge.create({
      user_id,
      badge_type,
      badge_name,
      badge_description,
      badge_icon
    });

    res.status(201).json(badge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
