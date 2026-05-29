const pool = require('../config/database');

class AIMessage {
  static async create(messageData) {
    const {
      conversation_id,
      role, // user, assistant, system
      content,
      metadata = {}
    } = messageData;

    const query = `
      INSERT INTO ai_messages (conversation_id, role, content, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [conversation_id, role, content, metadata];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating AI message: ${error.message}`);
    }
  }

  static async findByConversation(conversationId, limit = 50) {
    const query = `
      SELECT * FROM ai_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [conversationId, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching AI messages: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT * FROM ai_messages WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching AI message: ${error.message}`);
    }
  }

  static async delete(id) {
    const query = `DELETE FROM ai_messages WHERE id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting AI message: ${error.message}`);
    }
  }

  static async deleteByConversation(conversationId) {
    const query = `DELETE FROM ai_messages WHERE conversation_id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [conversationId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error deleting AI messages: ${error.message}`);
    }
  }
}

module.exports = AIMessage;
