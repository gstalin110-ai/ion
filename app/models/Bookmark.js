const pool = require('../config/database');

class Bookmark {
  static async create(bookmarkData) {
    const {
      user_id,
      item_type,
      item_id
    } = bookmarkData;

    const query = `
      INSERT INTO bookmarks (user_id, item_type, item_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, item_type, item_id) DO NOTHING
      RETURNING *
    `;

    const values = [user_id, item_type, item_id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating bookmark: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT b.*, 
             CASE 
               WHEN b.item_type = 'product' THEN p.title
               WHEN b.item_type = 'post' THEN po.content
               WHEN b.item_type = 'live' THEN l.title
               WHEN b.item_type = 'story' THEN s.content
             END as title,
             CASE 
               WHEN b.item_type = 'product' THEN p.image_url
               WHEN b.item_type = 'post' THEN po.image_url
               WHEN b.item_type = 'live' THEN l.thumbnail_url
               WHEN b.item_type = 'story' THEN s.image_url
             END as image_url
      FROM bookmarks b
      LEFT JOIN products p ON b.item_type = 'product' AND b.item_id = p.id
      LEFT JOIN posts po ON b.item_type = 'post' AND b.item_id = po.id
      LEFT JOIN lives l ON b.item_type = 'live' AND b.item_id = l.id
      LEFT JOIN stories s ON b.item_type = 'story' AND b.item_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching bookmarks: ${error.message}`);
    }
  }

  static async delete(userId, itemType, itemId) {
    const query = `
      DELETE FROM bookmarks 
      WHERE user_id = $1 AND item_type = $2 AND item_id = $3
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [userId, itemType, itemId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting bookmark: ${error.message}`);
    }
  }

  static async checkExists(userId, itemType, itemId) {
    const query = `
      SELECT id FROM bookmarks 
      WHERE user_id = $1 AND item_type = $2 AND item_id = $3
    `;

    try {
      const result = await pool.query(query, [userId, itemType, itemId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error checking bookmark: ${error.message}`);
    }
  }
}

module.exports = Bookmark;
