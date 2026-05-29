const pool = require('../config/database');

class Like {
  static async create(userId, postId) {
    const query = `
      INSERT INTO likes (user_id, post_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, post_id) DO NOTHING
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [userId, postId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating like: ${error.message}`);
    }
  }

  static async delete(userId, postId) {
    const query = `
      DELETE FROM likes 
      WHERE user_id = $1 AND post_id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [userId, postId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting like: ${error.message}`);
    }
  }

  static async findByPost(postId) {
    const query = `
      SELECT l.*, u.username, u.avatar
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = $1
      ORDER BY l.created_at DESC
    `;

    try {
      const result = await pool.query(query, [postId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching likes: ${error.message}`);
    }
  }

  static async checkLike(userId, postId) {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM likes 
        WHERE user_id = $1 AND post_id = $2
      ) as is_liked
    `;

    try {
      const result = await pool.query(query, [userId, postId]);
      return result.rows[0].is_liked;
    } catch (error) {
      throw new Error(`Error checking like: ${error.message}`);
    }
  }
}

module.exports = Like;
