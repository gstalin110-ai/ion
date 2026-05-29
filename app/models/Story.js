const pool = require('../config/database');

class Story {
  static async create(storyData) {
    const {
      user_id,
      media_url,
      media_type = 'image', // image, video
      caption
    } = storyData;

    const query = `
      INSERT INTO stories (user_id, media_url, media_type, caption)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [user_id, media_url, media_type, caption];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating story: ${error.message}`);
    }
  }

  static async findActive() {
    const query = `
      SELECT s.*, 
             u.username, u.avatar
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.expires_at > NOW()
      ORDER BY s.created_at DESC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching active stories: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT s.*, 
             u.username, u.avatar
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = $1 AND s.expires_at > NOW()
      ORDER BY s.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user stories: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT s.*, 
             u.username, u.avatar
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching story: ${error.message}`);
    }
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM stories 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting story: ${error.message}`);
    }
  }

  static async markAsViewed(storyId, userId) {
    const query = `
      INSERT INTO story_views (story_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (story_id, user_id) DO NOTHING
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [storyId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking story as viewed: ${error.message}`);
    }
  }

  static async getViewCount(storyId) {
    const query = `
      SELECT COUNT(*) as count
      FROM story_views
      WHERE story_id = $1
    `;

    try {
      const result = await pool.query(query, [storyId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`Error getting view count: ${error.message}`);
    }
  }
}

module.exports = Story;
