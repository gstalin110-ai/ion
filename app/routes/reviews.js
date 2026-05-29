const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.findByProduct(req.params.productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's reviews
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.findByUser(req.params.userId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product review stats
router.get('/stats/:productId', async (req, res) => {
  try {
    const stats = await Review.getProductStats(req.params.productId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create review
router.post('/', auth, [
  body('product_id').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reviewData = {
      ...req.body,
      user_id: req.user.id,
      images: req.body.images || []
    };

    const review = await Review.create(reviewData);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    const updatedReview = await Review.update(req.params.id, req.body);
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await Review.delete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
