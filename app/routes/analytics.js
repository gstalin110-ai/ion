const express = require('express');
const Analytics = require('../models/Analytics');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const days = req.query.days || 30;
    const stats = await Analytics.getDashboardStats(req.user.id, days);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get engagement rate
router.get('/engagement', auth, async (req, res) => {
  try {
    const days = req.query.days || 30;
    const engagement = await Analytics.getEngagementRate(req.user.id, days);
    res.json(engagement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top posts
router.get('/top-posts', auth, async (req, res) => {
  try {
    const limit = req.query.limit || 5;
    const posts = await Analytics.getTopPosts(req.user.id, limit);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get audience demographics
router.get('/demographics', auth, async (req, res) => {
  try {
    const demographics = await Analytics.getAudienceDemographics(req.user.id);
    res.json(demographics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get follower growth
router.get('/follower-growth', auth, async (req, res) => {
  try {
    const days = req.query.days || 30;
    const growth = await Analytics.getFollowerGrowth(req.user.id, days);
    res.json(growth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
