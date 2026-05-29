const express = require('express');
const { body, validationResult } = require('express-validator');
const Friendship = require('../models/Friendship');
const Follow = require('../models/Follow');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Friendships
router.post('/friends/request', auth, async (req, res) => {
  try {
    const { friend_id } = req.body;
    
    if (friend_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const friendship = await Friendship.create(req.user.id, friend_id);
    res.status(201).json(friendship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/friends/accept', auth, async (req, res) => {
  try {
    const { friend_id } = req.body;
    const friendship = await Friendship.acceptRequest(req.user.id, friend_id);
    res.json(friendship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/friends/reject', auth, async (req, res) => {
  try {
    const { friend_id } = req.body;
    await Friendship.rejectRequest(req.user.id, friend_id);
    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/friends/:friendId', auth, async (req, res) => {
  try {
    await Friendship.removeFriend(req.user.id, req.params.friendId);
    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/friends', auth, async (req, res) => {
  try {
    const friends = await Friendship.getFriends(req.user.id);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/friends/pending', auth, async (req, res) => {
  try {
    const requests = await Friendship.getPendingRequests(req.user.id);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/friends/check/:userId', auth, async (req, res) => {
  try {
    const friendship = await Friendship.checkFriendship(req.user.id, req.params.userId);
    res.json(friendship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follows
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    await Follow.create(req.user.id, req.params.userId);
    res.json({ message: 'Followed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/follow/:userId', auth, async (req, res) => {
  try {
    await Follow.delete(req.user.id, req.params.userId);
    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/followers', auth, async (req, res) => {
  try {
    const followers = await Follow.getFollowers(req.user.id);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/following', auth, async (req, res) => {
  try {
    const following = await Follow.getFollowing(req.user.id);
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/follow/check/:userId', auth, async (req, res) => {
  try {
    const isFollowing = await Follow.checkFollow(req.user.id, req.params.userId);
    res.json({ is_following: isFollowing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/follow/stats/:userId', async (req, res) => {
  try {
    const stats = await Follow.getFollowStats(req.params.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
