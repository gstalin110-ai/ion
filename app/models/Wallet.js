const pool = require('../config/database');

class Wallet {
  static async findByUser(userId) {
    const query = `
      SELECT * FROM wallets WHERE user_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching wallet: ${error.message}`);
    }
  }

  static async create(userId) {
    const query = `
      INSERT INTO wallets (user_id, balance, available_balance, currency)
      VALUES ($1, 0, 0, 'USD')
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating wallet: ${error.message}`);
    }
  }

  static async getOrCreate(userId) {
    let wallet = await this.findByUser(userId);
    if (!wallet) {
      wallet = await this.create(userId);
    }
    return wallet;
  }

  static async updateBalance(userId, amount, type = 'credit') {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const wallet = await this.findByUser(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const newBalance = type === 'credit' 
        ? parseFloat(wallet.balance) + parseFloat(amount)
        : parseFloat(wallet.balance) - parseFloat(amount);

      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      const query = `
        UPDATE wallets 
        SET balance = $1, available_balance = $1, updated_at = NOW()
        WHERE user_id = $2
        RETURNING *
      `;

      const result = await client.query(query, [newBalance, userId]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async freezeAmount(userId, amount) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const wallet = await this.findByUser(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (parseFloat(wallet.available_balance) < parseFloat(amount)) {
        throw new Error('Insufficient available balance');
      }

      const newAvailableBalance = parseFloat(wallet.available_balance) - parseFloat(amount);
      const newFrozenBalance = parseFloat(wallet.frozen_balance || 0) + parseFloat(amount);

      const query = `
        UPDATE wallets 
        SET available_balance = $1, frozen_balance = $2, updated_at = NOW()
        WHERE user_id = $3
        RETURNING *
      `;

      const result = await client.query(query, [newAvailableBalance, newFrozenBalance, userId]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async unfreezeAmount(userId, amount) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const wallet = await this.findByUser(userId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const newAvailableBalance = parseFloat(wallet.available_balance) + parseFloat(amount);
      const newFrozenBalance = parseFloat(wallet.frozen_balance || 0) - parseFloat(amount);

      const query = `
        UPDATE wallets 
        SET available_balance = $1, frozen_balance = $2, updated_at = NOW()
        WHERE user_id = $3
        RETURNING *
      `;

      const result = await client.query(query, [newAvailableBalance, newFrozenBalance, userId]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getStats(userId) {
    const query = `
      SELECT 
        w.balance,
        w.available_balance,
        w.frozen_balance,
        COALESCE(SUM(CASE WHEN t.type = 'credit' THEN t.amount ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN t.type = 'debit' THEN t.amount ELSE 0 END), 0) as total_debits,
        COUNT(t.id) as total_transactions
      FROM wallets w
      LEFT JOIN transactions t ON w.user_id = t.user_id
      WHERE w.user_id = $1
      GROUP BY w.balance, w.available_balance, w.frozen_balance
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching wallet stats: ${error.message}`);
    }
  }
}

module.exports = Wallet;
