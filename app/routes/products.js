const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { auth, optionalAuth, sellerAuth } = require('../middleware/auth');

const router = express.Router();

// Get all products with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const filters = {
      category_id: req.query.category_id,
      min_price: req.query.min_price,
      max_price: req.query.max_price,
      location: req.query.location,
      search: req.query.search,
      sort: req.query.sort,
      limit: req.query.limit || 20,
      offset: req.query.offset || 0
    };

    const products = await Product.findAll(filters);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recommended products
router.get('/recommended', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = req.query.limit || 10;
    const products = await Product.getRecommended(userId, limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (seller only)
router.post('/', sellerAuth, [
  body('title').trim().isLength({ min: 5, max: 100 }),
  body('description').trim().isLength({ min: 10, max: 2000 }),
  body('price').isFloat({ min: 0 }),
  body('currency').isIn(['USD', 'EUR', 'GBP', 'EC']),
  body('category_id').isInt(),
  body('stock').isInt({ min: 0 }),
  body('location').trim(),
  body('delivery_type').isIn(['delivery', 'pickup', 'both'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = {
      ...req.body,
      seller_id: req.user.id,
      images: req.body.images || [],
      status: 'pending'
    };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (seller only, owner check)
router.put('/:id', sellerAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updatedProduct = await Product.update(req.params.id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (seller only, owner check)
router.delete('/:id', sellerAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await Product.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller's products
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const products = await Product.findBySeller(req.params.sellerId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
