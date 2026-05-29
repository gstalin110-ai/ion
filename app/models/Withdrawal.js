const pool = require('../config/database');

class Withdrawal {
  static async create(withdrawalData) {
    const {
      user_id,
      amount,
      method, // bank_transfer, digital_wallet
      bank_name,
      account_number,
      account_holder,
      status = 'pending'
    } = withdrawalData;

    const query = `
      INSERT INTO withdrawals (
        user_id, amount, method, bank_name, 
        account_number, account_holder, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      user_id, amount, method, bank_name,
      account_number, account_holder, status
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating withdrawal: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT w.* 
      FROM withdrawals w
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching withdrawals: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `SELECT * FROM withdrawals WHERE id = $1`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching withdrawal: ${error.message}`);
    }
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE withdrawals 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating withdrawal status: ${error.message}`);
    }
  }

  static async getPending() {
    const query = `
      SELECT w.*, u.username, u.email
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      WHERE w.status = 'pending'
      ORDER BY w.created_at ASC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching pending withdrawals: ${error.message}`);
    }
  }
}

module.exports = Withdrawal;
