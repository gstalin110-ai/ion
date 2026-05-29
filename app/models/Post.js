const pool = require('../config/database');

class Post {
  static async create(postData) {
    const {
      user_id,
      content,
      post_type = 'text', // text, photo, video, story
      media_urls = [],
      product_id = null,
      location = null,
      visibility = 'public', // public, friends, private
      mentions = [],
      hashtags = []
    } = postData;

    const query = `
      INSERT INTO posts (
        user_id, content, post_type, media_urls, product_id,
        location, visibility, mentions, hashtags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      user_id, content, post_type, media_urls, product_id,
      location, visibility, mentions, hashtags
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating post: ${error.message}`);
    }
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.username, u.avatar, u.rating as user_rating,
             COUNT(DISTINCT l.id) as likes_count,
             COUNT(DISTINCT c.id) as comments_count,
             COUNT(DISTINCT s.id) as shares_count,
             COALESCE(
               (SELECT COUNT(*) FROM likes WHERE user_id = $2 AND post_id = p.id), 0
             ) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN shares s ON p.id = s.post_id
      WHERE p.visibility = 'public'
    `;

    const params = [];
    let paramCount = 1;
    params.push(filters.user_id || null);
    paramCount++;

    if (filters.feed_type) {
      switch (filters.feed_type) {
        case 'friends':
          query += ` AND p.user_id IN (
            SELECT friend_id FROM friendships 
            WHERE user_id = $${paramCount} AND status = 'accepted'
            UNION
            SELECT user_id FROM friendships 
            WHERE friend_id = $${paramCount} AND status = 'accepted'
          )`;
          params.push(filters.user_id);
          paramCount++;
          break;
        case 'local':
          query += ` AND p.location ILIKE $${paramCount}`;
          params.push(`%${filters.location || ''}%`);
          paramCount++;
          break;
      }
    }

    if (filters.user_id && !filters.feed_type) {
      query += ` AND p.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.post_type) {
      query += ` AND p.post_type = $${paramCount}`;
      params.push(filters.post_type);
      paramCount++;
    }

    query += ` GROUP BY p.id, u.username, u.avatar, u.rating`;

    if (filters.sort) {
      switch (filters.sort) {
        case 'trending':
          query += ` ORDER BY (likes_count + comments_count + shares_count) DESC`;
          break;
        case 'recent':
        default:
          query += ` ORDER BY p.created_at DESC`;
      }
    } else {
      query += ` ORDER BY p.created_at DESC`;
    }

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
      throw new Error(`Error fetching posts: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT p.*, u.username, u.avatar, u.rating as user_rating,
             COUNT(DISTINCT l.id) as likes_count,
             COUNT(DISTINCT c.id) as comments_count,
             COUNT(DISTINCT s.id) as shares_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN shares s ON p.id = s.post_id
      WHERE p.id = $1
      GROUP BY p.id, u.username, u.avatar, u.rating
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching post: ${error.message}`);
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
      UPDATE posts 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating post: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `DELETE FROM posts WHERE id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting post: ${error.message}`);
    }
  }

  static async getTrending(limit = 10) {
    const query = `
      SELECT p.*, u.username, u.avatar,
             COUNT(DISTINCT l.id) as engagement
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE p.created_at > NOW() - INTERVAL '24 hours'
      GROUP BY p.id, u.username, u.avatar
      ORDER BY engagement DESC
      LIMIT $1
    `;

    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching trending posts: ${error.message}`);
    }
  }
}

module.exports = Post;
