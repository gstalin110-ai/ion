const pool = require('../config/database');

class Analytics {
  static async getDashboardStats(userId, days = 30) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days') as posts_count,
        (SELECT COUNT(*) FROM post_likes WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days') as likes_given,
        (SELECT COUNT(*) FROM post_likes pl JOIN posts p ON pl.post_id = p.id WHERE p.user_id = $1 AND pl.created_at >= NOW() - INTERVAL '${days} days') as likes_received,
        (SELECT COUNT(*) FROM comments WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days') as comments_made,
        (SELECT COUNT(*) FROM comments c JOIN posts p ON c.post_id = p.id WHERE p.user_id = $1 AND c.created_at >= NOW() - INTERVAL '${days} days') as comments_received,
        (SELECT COUNT(DISTINCT post_id) FROM post_views WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days') as posts_viewed,
        (SELECT COUNT(*) FROM post_views pv JOIN posts p ON pv.post_id = p.id WHERE p.user_id = $1 AND pv.created_at >= NOW() - INTERVAL '${days} days') as profile_views
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching dashboard stats: ${error.message}`);
    }
  }

  static async getEngagementRate(userId, days = 30) {
    const query = `
      SELECT 
        COUNT(DISTINCT pl.id) as total_likes,
        COUNT(DISTINCT c.id) as total_comments,
        COUNT(DISTINCT pv.id) as total_views,
        COUNT(DISTINCT p.id) as total_posts
      FROM posts p
      LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.created_at >= NOW() - INTERVAL '${days} days'
      LEFT JOIN comments c ON p.id = c.post_id AND c.created_at >= NOW() - INTERVAL '${days} days'
      LEFT JOIN post_views pv ON p.id = pv.post_id AND pv.created_at >= NOW() - INTERVAL '${days} days'
      WHERE p.user_id = $1 AND p.created_at >= NOW() - INTERVAL '${days} days'
    `;

    try {
      const result = await pool.query(query, [userId]);
      const stats = result.rows[0];
      
      const engagementRate = stats.total_views > 0 
        ? ((stats.total_likes + stats.total_comments) / stats.total_views) * 100 
        : 0;

      return {
        engagement_rate: engagementRate.toFixed(2),
        ...stats
      };
    } catch (error) {
      throw new Error(`Error calculating engagement rate: ${error.message}`);
    }
  }

  static async getTopPosts(userId, limit = 5) {
    const query = `
      SELECT p.*,
             COUNT(DISTINCT pl.id) as likes_count,
             COUNT(DISTINCT c.id) as comments_count,
             COUNT(DISTINCT pv.id) as views_count
      FROM posts p
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN post_views pv ON p.id = pv.post_id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY views_count DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching top posts: ${error.message}`);
    }
  }

  static async getAudienceDemographics(userId) {
    const query = `
      SELECT 
        COUNT(DISTINCT CASE WHEN u.age BETWEEN 18 AND 24 THEN pv.user_id END) as age_18_24,
        COUNT(DISTINCT CASE WHEN u.age BETWEEN 25 AND 34 THEN pv.user_id END) as age_25_34,
        COUNT(DISTINCT CASE WHEN u.age BETWEEN 35 AND 44 THEN pv.user_id END) as age_35_44,
        COUNT(DISTINCT CASE WHEN u.age >= 45 THEN pv.user_id END) as age_45_plus
      FROM post_views pv
      JOIN posts p ON pv.post_id = p.id
      JOIN users u ON pv.user_id = u.id
      WHERE p.user_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching demographics: ${error.message}`);
    }
  }

  static async getFollowerGrowth(userId, days = 30) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_followers
      FROM follows
      WHERE following_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching follower growth: ${error.message}`);
    }
  }
}

module.exports = Analytics;
