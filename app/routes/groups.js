const express = require('express');
const { body, validationResult } = require('express-validator');
const Group = require('../models/Group');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all public groups
router.get('/', async (req, res) => {
  try {
    const filters = {
      category: req.query.category
    };
    const groups = await Group.findAll(filters);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's groups
router.get('/my', auth, async (req, res) => {
  try {
    const groups = await Group.findByUser(req.user.id);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create group
router.post('/', auth, [
  body('name').trim().isLength({ min: 3, max: 100 }),
  body('description').optional().trim(),
  body('image_url').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const group = await Group.create({
      user_id: req.user.id,
      ...req.body
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.is_private) {
      return res.status(403).json({ error: 'Private group requires invitation' });
    }

    await Group.addMember(req.params.id, req.user.id);
    res.json({ message: 'Joined group' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave group
router.post('/:id/leave', auth, async (req, res) => {
  try {
    await Group.removeMember(req.params.id, req.user.id);
    res.json({ message: 'Left group' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group members
router.get('/:id/members', async (req, res) => {
  try {
    const members = await Group.getMembers(req.params.id);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
