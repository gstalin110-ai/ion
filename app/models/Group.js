const pool = require('../config/database');

class Group {
  static async create(groupData) {
    const {
      user_id,
      name,
      description,
      image_url,
      category = 'general',
      is_private = false
    } = groupData;

    const query = `
      INSERT INTO groups (user_id, name, description, image_url, category, is_private)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [user_id, name, description, image_url, category, is_private];

    try {
      const result = await pool.query(query, values);
      // Add creator as admin
      await pool.query(
        'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
        [result.rows[0].id, user_id, 'admin']
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating group: ${error.message}`);
    }
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT g.*, 
             u.username as creator_username,
             COUNT(DISTINCT gm.id) as member_count
      FROM groups g
      JOIN users u ON g.user_id = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.is_private = false
    `;

    const params = [];
    let paramCount = 1;

    if (filters.category) {
      query += ` AND g.category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    query += ` GROUP BY g.id, u.username ORDER BY g.created_at DESC`;

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching groups: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT g.*, 
             u.username as creator_username,
             COUNT(DISTINCT gm.id) as member_count
      FROM groups g
      JOIN users u ON g.user_id = u.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.id = $1
      GROUP BY g.id, u.username
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching group: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT g.*, 
             gm.role,
             COUNT(DISTINCT gm2.id) as member_count
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN group_members gm2 ON g.id = gm2.group_id
      WHERE gm.user_id = $1
      GROUP BY g.id, gm.role
      ORDER BY g.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user groups: ${error.message}`);
    }
  }

  static async addMember(groupId, userId, role = 'member') {
    const query = `
      INSERT INTO group_members (group_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (group_id, user_id) DO NOTHING
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [groupId, userId, role]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error adding member: ${error.message}`);
    }
  }

  static async removeMember(groupId, userId) {
    const query = `
      DELETE FROM group_members 
      WHERE group_id = $1 AND user_id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [groupId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error removing member: ${error.message}`);
    }
  }

  static async getMembers(groupId) {
    const query = `
      SELECT u.*, gm.role, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = $1
      ORDER BY gm.joined_at ASC
    `;

    try {
      const result = await pool.query(query, [groupId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching members: ${error.message}`);
    }
  }
}

module.exports = Group;
