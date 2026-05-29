const pool = require('../config/database');

class Product {
  static async create(productData) {
    const {
      seller_id,
      title,
      description,
      price,
      currency,
      category_id,
      stock,
      images,
      location,
      delivery_type,
      status = 'pending'
    } = productData;

    const query = `
      INSERT INTO products (
        seller_id, title, description, price, currency, 
        category_id, stock, images, location, delivery_type, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      seller_id, title, description, price, currency,
      category_id, stock, images, location, delivery_type, status
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.username as seller_name, u.rating as seller_rating,
             c.name as category_name, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.status = 'approved'
    `;

    const params = [];
    let paramCount = 1;

    if (filters.category_id) {
      query += ` AND p.category_id = $${paramCount}`;
      params.push(filters.category_id);
      paramCount++;
    }

    if (filters.min_price) {
      query += ` AND p.price >= $${paramCount}`;
      params.push(filters.min_price);
      paramCount++;
    }

    if (filters.max_price) {
      query += ` AND p.price <= $${paramCount}`;
      params.push(filters.max_price);
      paramCount++;
    }

    if (filters.location) {
      query += ` AND p.location ILIKE $${paramCount}`;
      params.push(`%${filters.location}%`);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ` GROUP BY p.id, u.username, u.rating, c.name`;

    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          query += ` ORDER BY p.price ASC`;
          break;
        case 'price_desc':
          query += ` ORDER BY p.price DESC`;
          break;
        case 'rating':
          query += ` ORDER BY avg_rating DESC`;
          break;
        case 'newest':
          query += ` ORDER BY p.created_at DESC`;
          break;
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
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT p.*, u.username as seller_name, u.rating as seller_rating,
             u.email as seller_email, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.id = $1
      GROUP BY p.id, u.username, u.rating, u.email, c.name
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  static async findBySeller(sellerId) {
    const query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.seller_id = $1
      GROUP BY p.id, c.name
      ORDER BY p.created_at DESC
    `;

    try {
      const result = await pool.query(query, [sellerId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching seller products: ${error.message}`);
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
      UPDATE products 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  static async updateStock(id, quantity) {
    const query = `
      UPDATE products 
      SET stock = stock - $1, updated_at = NOW()
      WHERE id = $2 AND stock >= $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [quantity, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating stock: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `DELETE FROM products WHERE id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  static async getRecommended(userId, limit = 10) {
    const query = `
      SELECT p.*, c.name as category_name,
             COALESCE(AVG(r.rating), 0) as avg_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.status = 'approved' AND p.stock > 0
      GROUP BY p.id, c.name
      ORDER BY avg_rating DESC, p.created_at DESC
      LIMIT $1
    `;

    try {
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching recommended products: ${error.message}`);
    }
  }
}

module.exports = Product;
