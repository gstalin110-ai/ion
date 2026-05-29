const pool = require('../config/database');

class Category {
  static async create(categoryData) {
    const { name, description, icon, parent_id } = categoryData;

    const query = `
      INSERT INTO categories (name, description, icon, parent_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [name, description, icon, parent_id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }

  static async findAll() {
    const query = `
      SELECT c.*, 
             COUNT(p.id) as product_count,
             (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) as subcategory_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'approved'
      GROUP BY c.id
      ORDER BY c.name
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT c.*, 
             COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'approved'
      WHERE c.id = $1
      GROUP BY c.id
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching category: ${error.message}`);
    }
  }

  static async findByParent(parentId) {
    const query = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'approved'
      WHERE c.parent_id = $1
      GROUP BY c.id
      ORDER BY c.name
    `;

    try {
      const result = await pool.query(query, [parentId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching subcategories: ${error.message}`);
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
      UPDATE categories 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `DELETE FROM categories WHERE id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }
}

module.exports = Category;
