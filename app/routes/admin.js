const express = require('express');
const { body, validationResult } = require('express-validator');
const AdminStats = require('../models/AdminStats');
const SystemConfig = require('../models/SystemConfig');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Middleware to check if user is admin
router.use(auth);
router.use(adminAuth);

// Get global stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await AdminStats.getGlobalStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user growth
router.get('/stats/users/growth', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const growth = await AdminStats.getUserGrowth(days);
    res.json(growth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue stats
router.get('/stats/revenue', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const revenue = await AdminStats.getRevenueStats(days);
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top sellers
router.get('/stats/sellers', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const sellers = await AdminStats.getTopSellers(limit);
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const activity = await AdminStats.getRecentActivity(limit);
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;
    const users = await User.findAll({ limit, offset });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/users/:id', [
  body('is_seller').optional().isBoolean(),
  body('is_active').optional().isBoolean(),
  body('is_admin').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.update(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending withdrawals
router.get('/withdrawals/pending', async (req, res) => {
  try {
    const withdrawals = await Withdrawal.getPending();
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve withdrawal
router.put('/withdrawals/:id/approve', async (req, res) => {
  try {
    const withdrawal = await Withdrawal.updateStatus(req.params.id, 'completed');
    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject withdrawal
router.put('/withdrawals/:id/reject', async (req, res) => {
  try {
    const withdrawal = await Withdrawal.updateStatus(req.params.id, 'rejected');
    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system config
router.get('/config', async (req, res) => {
  try {
    const config = await SystemConfig.get();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update system config
router.put('/config', [
  body('commission_rate').optional().isFloat({ min: 0, max: 50 }),
  body('min_withdrawal').optional().isFloat({ min: 0 }),
  body('maintenance_mode').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const config = await SystemConfig.update(req.body);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
