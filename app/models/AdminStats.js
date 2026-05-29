const pool = require('../config/database');

class AdminStats {
  static async getGlobalStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_seller = true) as total_sellers,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM posts) as total_posts,
        (SELECT COUNT(*) FROM transactions) as total_transactions,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'credit') as total_credits,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'debit') as total_debits,
        (SELECT COUNT(*) FROM withdrawals WHERE status = 'pending') as pending_withdrawals,
        (SELECT COUNT(*) FROM disputes WHERE status = 'pending') as pending_disputes,
        (SELECT COUNT(*) FROM ai_conversations) as total_ai_conversations
    `;

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching global stats: ${error.message}`);
    }
  }

  static async getUserGrowth(days = 30) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user growth: ${error.message}`);
    }
  }

  static async getRevenueStats(days = 30) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as credits,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as debits
      FROM transactions
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching revenue stats: ${error.message}`);
    }
  }

  static async getTopSellers(limit = 10) {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.avatar,
        u.rating,
        COUNT(p.id) as product_count,
        COALESCE(SUM(p.views), 0) as total_views
      FROM users u
      LEFT JOIN products p ON u.id = p.user_id
      WHERE u.is_seller = true
      GROUP BY u.id, u.username, u.avatar, u.rating
      ORDER BY product_count DESC
      LIMIT $1
    `;

    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching top sellers: ${error.message}`);
    }
  }

  static async getRecentActivity(limit = 20) {
    const query = `
      SELECT 
        'user' as type,
        u.username,
        u.created_at as timestamp
      FROM users u
      WHERE u.created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'product' as type,
        p.title as username,
        p.created_at as timestamp
      FROM products p
      WHERE p.created_at >= NOW() - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'transaction' as type,
        t.description as username,
        t.created_at as timestamp
      FROM transactions t
      WHERE t.created_at >= NOW() - INTERVAL '7 days'
      
      ORDER BY timestamp DESC
      LIMIT $1
    `;

    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching recent activity: ${error.message}`);
    }
  }
}

module.exports = AdminStats;
