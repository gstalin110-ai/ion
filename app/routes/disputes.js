const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get user's disputes
router.get('/my', auth, async (req, res) => {
  try {
    const query = `
      SELECT d.*, 
             p.title as product_title,
             u.username as other_party_username
      FROM disputes d
      LEFT JOIN products p ON d.product_id = p.id
      LEFT JOIN users u ON d.other_party_id = u.id
      WHERE d.user_id = $1 OR d.other_party_id = $1
      ORDER BY d.created_at DESC
    `;

    const result = await pool.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create dispute
router.post('/', auth, [
  body('order_id').isInt(),
  body('reason').trim().isLength({ min: 10, max: 500 }),
  body('dispute_type').isIn(['product_not_received', 'product_not_as_described', 'refund_request', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { order_id, reason, dispute_type, product_id } = req.body;

    // Get order details to find other party
    const orderQuery = 'SELECT seller_id, buyer_id FROM orders WHERE id = $1';
    const orderResult = await pool.query(orderQuery, [order_id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const other_party_id = req.user.id === order.buyer_id ? order.seller_id : order.buyer_id;

    const query = `
      INSERT INTO disputes (user_id, other_party_id, order_id, product_id, reason, dispute_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [req.user.id, other_party_id, order_id, product_id, reason, dispute_type];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dispute by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const query = `
      SELECT d.*, 
             p.title as product_title,
             u.username as other_party_username
      FROM disputes d
      LEFT JOIN products p ON d.product_id = p.id
      LEFT JOIN users u ON d.other_party_id = u.id
      WHERE d.id = $1 AND (d.user_id = $2 OR d.other_party_id = $2)
    `;

    const result = await pool.query(query, [req.params.id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dispute not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add message to dispute
router.post('/:id/messages', auth, [
  body('message').trim().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query = `
      INSERT INTO dispute_messages (dispute_id, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(query, [req.params.id, req.user.id, req.body.message]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dispute messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const query = `
      SELECT dm.*, u.username, u.avatar
      FROM dispute_messages dm
      JOIN users u ON dm.user_id = u.id
      WHERE dm.dispute_id = $1
      ORDER BY dm.created_at ASC
    `;

    const result = await pool.query(query, [req.params.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
