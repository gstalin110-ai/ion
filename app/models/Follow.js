const pool = require('../config/database');

class Follow {
  static async create(followerId, followingId) {
    const query = `
      INSERT INTO follows (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT (follower_id, following_id) DO NOTHING
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [followerId, followingId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating follow: ${error.message}`);
    }
  }

  static async delete(followerId, followingId) {
    const query = `
      DELETE FROM follows 
      WHERE follower_id = $1 AND following_id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [followerId, followingId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting follow: ${error.message}`);
    }
  }

  static async getFollowers(userId) {
    const query = `
      SELECT u.id, u.username, u.avatar, u.rating,
             f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching followers: ${error.message}`);
    }
  }

  static async getFollowing(userId) {
    const query = `
      SELECT u.id, u.username, u.avatar, u.rating,
             f.created_at as following_since
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching following: ${error.message}`);
    }
  }

  static async checkFollow(followerId, followingId) {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = $1 AND following_id = $2
      ) as is_following
    `;

    try {
      const result = await pool.query(query, [followerId, followingId]);
      return result.rows[0].is_following;
    } catch (error) {
      throw new Error(`Error checking follow: ${error.message}`);
    }
  }

  static async getFollowStats(userId) {
    const query = `
      SELECT 
        COUNT(DISTINCT CASE WHEN follower_id = $1 THEN 1 END) as following_count,
        COUNT(DISTINCT CASE WHEN following_id = $1 THEN 1 END) as followers_count
      FROM follows
      WHERE follower_id = $1 OR following_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching follow stats: ${error.message}`);
    }
  }
}

module.exports = Follow;
