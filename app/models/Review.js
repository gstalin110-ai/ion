const pool = require('../config/database');

class Review {
  static async create(reviewData) {
    const { user_id, product_id, rating, comment, images } = reviewData;

    const query = `
      INSERT INTO reviews (user_id, product_id, rating, comment, images)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [user_id, product_id, rating, comment, images];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('You have already reviewed this product');
      }
      throw new Error(`Error creating review: ${error.message}`);
    }
  }

  static async findByProduct(productId) {
    const query = `
      SELECT r.*, u.username, u.rating as user_rating
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `;

    try {
      const result = await pool.query(query, [productId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching reviews: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT r.*, p.title as product_title, p.images as product_images,
             u.username as seller_name
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user reviews: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT r.*, u.username, p.title as product_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching review: ${error.message}`);
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
      UPDATE reviews 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating review: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `DELETE FROM reviews WHERE id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting review: ${error.message}`);
    }
  }

  static async getProductStats(productId) {
    const query = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews
      WHERE product_id = $1
    `;

    try {
      const result = await pool.query(query, [productId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching product review stats: ${error.message}`);
    }
  }
}

module.exports = Review;
