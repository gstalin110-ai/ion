const pool = require('../config/database');

class OrderQR {
  static async generate(orderData) {
    const {
      order_id,
      user_id,
      product_id,
      amount,
      currency = 'USD'
    } = orderData;

    const qr_code = `sogytweb://order/${order_id}`;
    const expires_at = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const query = `
      INSERT INTO order_qr_codes (order_id, user_id, product_id, qr_code, amount, currency, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [order_id, user_id, product_id, qr_code, amount, currency, expires_at];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error generating QR code: ${error.message}`);
    }
  }

  static async findByOrder(orderId) {
    const query = `
      SELECT * FROM order_qr_codes 
      WHERE order_id = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [orderId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching QR code: ${error.message}`);
    }
  }

  static async findByCode(qrCode) {
    const query = `
      SELECT * FROM order_qr_codes 
      WHERE qr_code = $1 AND expires_at > NOW()
    `;

    try {
      const result = await pool.query(query, [qrCode]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching QR code: ${error.message}`);
    }
  }

  static async markAsScanned(qrId) {
    const query = `
      UPDATE order_qr_codes 
      SET scanned = true, scanned_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [qrId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking QR as scanned: ${error.message}`);
    }
  }
}

module.exports = OrderQR;
