const pool = require('../config/database');

class Comment {
  static async create(commentData) {
    const {
      user_id,
      post_id,
      content,
      parent_id = null,
      media_urls = [],
      mentions = []
    } = commentData;

    const query = `
      INSERT INTO comments (
        user_id, post_id, content, parent_id, media_urls, mentions
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [user_id, post_id, content, parent_id, media_urls, mentions];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating comment: ${error.message}`);
    }
  }

  static async findByPost(postId) {
    const query = `
      SELECT c.*, u.username, u.avatar,
             COUNT(DISTINCT cl.id) as likes_count
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id
      WHERE c.post_id = $1 AND c.parent_id IS NULL
      GROUP BY c.id, u.username, u.avatar
      ORDER BY c.created_at DESC
    `;

    try {
      const result = await pool.query(query, [postId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching comments: ${error.message}`);
    }
  }

  static async findReplies(commentId) {
    const query = `
      SELECT c.*, u.username, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = $1
      ORDER BY c.created_at ASC
    `;

    try {
      const result = await pool.query(query, [commentId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching replies: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT c.*, u.username, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching comment: ${error.message}`);
    }
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE comments 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating comment: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `DELETE FROM comments WHERE id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting comment: ${error.message}`);
    }
  }
}

module.exports = Comment;
