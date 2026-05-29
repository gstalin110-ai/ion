const express = require('express');
const { body, validationResult } = require('express-validator');
const OrderQR = require('../models/OrderQR');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate QR code for order
router.post('/generate', auth, [
  body('order_id').isInt(),
  body('product_id').isInt(),
  body('amount').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const qr = await OrderQR.generate({
      user_id: req.user.id,
      ...req.body
    });

    res.status(201).json(qr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get QR code by order ID
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const qr = await OrderQR.findByOrder(req.params.orderId);
    if (!qr) {
      return res.status(404).json({ error: 'QR code not found or expired' });
    }
    res.json(qr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan QR code
router.post('/scan', [
  body('qr_code').trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const qr = await OrderQR.findByCode(req.body.qr_code);
    if (!qr) {
      return res.status(404).json({ error: 'QR code not found or expired' });
    }

    if (qr.scanned) {
      return res.status(400).json({ error: 'QR code already scanned' });
    }

    await OrderQR.markAsScanned(qr.id);
    res.json({ message: 'QR code scanned', order_id: qr.order_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
