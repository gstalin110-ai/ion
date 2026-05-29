const pool = require('../config/database');

class SystemConfig {
  static async get() {
    const query = `SELECT * FROM system_config WHERE id = 1`;

    try {
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching system config: ${error.message}`);
    }
  }

  static async update(configData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(configData).forEach(key => {
      if (configData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(configData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE system_config 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating system config: ${error.message}`);
    }
  }
}

module.exports = SystemConfig;
