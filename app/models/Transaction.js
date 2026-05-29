const pool = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const {
      user_id,
      type, // credit, debit, transfer, withdrawal, deposit
      amount,
      currency = 'USD',
      description,
      status = 'completed', // pending, completed, failed, cancelled
      reference_id = null,
      metadata = {}
    } = transactionData;

    const query = `
      INSERT INTO transactions (
        user_id, type, amount, currency, description, 
        status, reference_id, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      user_id, type, amount, currency, description,
      status, reference_id, metadata
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  static async findByUser(userId, filters = {}) {
    let query = `
      SELECT t.* 
      FROM transactions t
      WHERE t.user_id = $1
    `;

    const params = [userId];
    let paramCount = 2;

    if (filters.type) {
      query += ` AND t.type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    query += ` ORDER BY t.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `SELECT * FROM transactions WHERE id = $1`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching transaction: ${error.message}`);
    }
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE transactions 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating transaction status: ${error.message}`);
    }
  }

  static async createTransfer(fromUserId, toUserId, amount, description) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Debit from sender
      await client.query(
        'UPDATE wallets SET balance = balance - $1, available_balance = available_balance - $1 WHERE user_id = $2',
        [amount, fromUserId]
      );

      // Credit to receiver
      await client.query(
        'UPDATE wallets SET balance = balance + $1, available_balance = available_balance + $1 WHERE user_id = $2',
        [amount, toUserId]
      );

      // Create debit transaction
      const debitResult = await client.query(
        `INSERT INTO transactions (user_id, type, amount, description, status)
         VALUES ($1, 'debit', $2, $3, 'completed')
         RETURNING *`,
        [fromUserId, amount, description]
      );

      // Create credit transaction
      const creditResult = await client.query(
        `INSERT INTO transactions (user_id, type, amount, description, status, reference_id)
         VALUES ($1, 'credit', $2, $3, 'completed', $4)
         RETURNING *`,
        [toUserId, amount, `Transfer from user ${fromUserId}`, debitResult.rows[0].id]
      );

      await client.query('COMMIT');
      return { debit: debitResult.rows[0], credit: creditResult.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Transaction;
