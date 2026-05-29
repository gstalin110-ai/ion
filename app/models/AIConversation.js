const pool = require('../config/database');

class AIConversation {
  static async create(conversationData) {
    const {
      user_id,
      title,
      context = 'general'
    } = conversationData;

    const query = `
      INSERT INTO ai_conversations (user_id, title, context)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [user_id, title, context];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating AI conversation: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT c.*, 
             COUNT(m.id) as message_count,
             (SELECT content FROM ai_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM ai_conversations c
      LEFT JOIN ai_messages m ON c.id = m.conversation_id
      WHERE c.user_id = $1
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching AI conversations: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `SELECT * FROM ai_conversations WHERE id = $1`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching AI conversation: ${error.message}`);
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
      UPDATE ai_conversations 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    values.push(id);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating AI conversation: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `DELETE FROM ai_conversations WHERE id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting AI conversation: ${error.message}`);
    }
  }
}

module.exports = AIConversation;
