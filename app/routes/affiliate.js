const express = require('express');
const { auth } = require('../middleware/auth');
const pool = require('../config/database');

const router = express.Router();

// Get user's affiliate data
router.get('/my', auth, async (req, res) => {
  try {
    const query = `
      SELECT a.*, 
             COUNT(DISTINCT ac.id) as total_clicks,
             COUNT(DISTINCT CASE WHEN ac.converted = true THEN ac.id END) as total_conversions
      FROM affiliates a
      LEFT JOIN affiliate_clicks ac ON a.id = ac.affiliate_id
      WHERE a.user_id = $1
      GROUP BY a.id
    `;

    const result = await pool.query(query, [req.user.id]);
    
    if (result.rows.length === 0) {
      // Create affiliate account
      const referralCode = `REF${req.user.id}${Date.now().toString(36)}`;
      const createQuery = `
        INSERT INTO affiliates (user_id, referral_code)
        VALUES ($1, $2)
        RETURNING *
      `;
      const createResult = await pool.query(createQuery, [req.user.id, referralCode]);
      return res.json(createResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track affiliate click
router.post('/track/:referralCode', async (req, res) => {
  try {
    const { referralCode } = req.params;
    const userId = req.body.user_id || null;
    const productId = req.body.product_id || null;
    const ipAddress = req.ip;

    const query = `
      INSERT INTO affiliate_clicks (affiliate_id, referrer_id, product_id, ip_address)
      SELECT $1, $2, $3, $4
      FROM affiliates
      WHERE referral_code = $5
      RETURNING *
    `;

    const result = await pool.query(query, [null, userId, productId, ipAddress, referralCode]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
