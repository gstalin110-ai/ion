const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const {
      username,
      email,
      password,
      phone,
      location,
      country = 'EC'
    } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, email, password, phone, location, country)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, phone, location, country, created_at
    `;

    const values = [username, email, hashedPassword, phone, location, country];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email or username already exists');
      }
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT id, username, email, phone, location, country, 
             rating, is_verified, is_seller, is_admin, is_active, created_at, updated_at
      FROM users WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'password') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, username, email, phone, location, country, rating, is_verified, is_seller
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = `
      UPDATE users 
      SET password = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `;

    try {
      const result = await pool.query(query, [hashedPassword, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getSellerStats(sellerId) {
    const query = `
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total), 0) as total_revenue,
        COALESCE(AVG(r.rating), 0) as avg_rating
      FROM users u
      LEFT JOIN products p ON u.id = p.seller_id
      LEFT JOIN orders o ON p.id = o.product_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE u.id = $1
      GROUP BY u.id
    `;

    try {
      const result = await pool.query(query, [sellerId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching seller stats: ${error.message}`);
    }
  }
}

module.exports = User;
