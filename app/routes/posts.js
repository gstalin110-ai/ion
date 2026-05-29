const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get posts (feed)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const filters = {
      user_id: req.user?.id,
      feed_type: req.query.feed_type || 'foryou',
      location: req.query.location,
      post_type: req.query.post_type,
      sort: req.query.sort || 'recent',
      limit: req.query.limit || 20,
      offset: req.query.offset || 0
    };

    const posts = await Post.findAll(filters);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get trending posts
router.get('/trending', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const posts = await Post.getTrending(limit);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create post
router.post('/', auth, [
  body('content').optional().trim().isLength({ max: 2000 }),
  body('post_type').isIn(['text', 'photo', 'video', 'story']),
  body('visibility').optional().isIn(['public', 'friends', 'private'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const postData = {
      ...req.body,
      user_id: req.user.id,
      media_urls: req.body.media_urls || []
    };

    const post = await Post.create(postData);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const updatedPost = await Post.update(req.params.id, req.body);
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.delete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like/Unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const isLiked = await Like.checkLike(req.user.id, req.params.id);
    
    if (isLiked) {
      await Like.delete(req.user.id, req.params.id);
      res.json({ liked: false });
    } else {
      await Like.create(req.user.id, req.params.id);
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post likes
router.get('/:id/likes', async (req, res) => {
  try {
    const likes = await Like.findByPost(req.params.id);
    res.json(likes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.findByPost(req.params.id);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create comment
router.post('/:id/comments', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const commentData = {
      ...req.body,
      user_id: req.user.id,
      post_id: req.params.id
    };

    const comment = await Comment.create(commentData);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
