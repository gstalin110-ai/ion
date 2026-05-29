const pool = require('../config/database');

class Live {
  static async create(liveData) {
    const {
      user_id,
      title,
      description,
      thumbnail_url,
      stream_url,
      category = 'general'
    } = liveData;

    const query = `
      INSERT INTO lives (user_id, title, description, thumbnail_url, stream_url, category)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [user_id, title, description, thumbnail_url, stream_url, category];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating live: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT l.*, 
             u.username, u.avatar,
             COUNT(DISTINCT v.id) as viewer_count
      FROM lives l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN live_viewers v ON l.id = v.live_id
      WHERE l.user_id = $1 AND l.status = 'live'
      GROUP BY l.id, u.username, u.avatar
      ORDER BY l.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user lives: ${error.message}`);
    }
  }

  static async findActive() {
    const query = `
      SELECT l.*, 
             u.username, u.avatar,
             COUNT(DISTINCT v.id) as viewer_count
      FROM lives l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN live_viewers v ON l.id = v.live_id
      WHERE l.status = 'live'
      GROUP BY l.id, u.username, u.avatar
      ORDER BY l.created_at DESC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching active lives: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT l.*, 
             u.username, u.avatar,
             COUNT(DISTINCT v.id) as viewer_count
      FROM lives l
      JOIN users u ON l.user_id = u.id
      LEFT JOIN live_viewers v ON l.id = v.live_id
      WHERE l.id = $1
      GROUP BY l.id, u.username, u.avatar
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching live: ${error.message}`);
    }
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE lives 
      SET status = $1, ended_at = CASE WHEN $1 = 'ended' THEN NOW() ELSE ended_at END
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating live status: ${error.message}`);
    }
  }

  static async addViewer(liveId, userId) {
    const query = `
      INSERT INTO live_viewers (live_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (live_id, user_id) DO NOTHING
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [liveId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error adding viewer: ${error.message}`);
    }
  }

  static async removeViewer(liveId, userId) {
    const query = `
      DELETE FROM live_viewers 
      WHERE live_id = $1 AND user_id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [liveId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error removing viewer: ${error.message}`);
    }
  }
}

module.exports = Live;
