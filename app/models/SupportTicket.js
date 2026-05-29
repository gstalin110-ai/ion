const pool = require('../config/database');

class SupportTicket {
  static async create(ticketData) {
    const {
      user_id,
      subject,
      description,
      category = 'general',
      priority = 'medium'
    } = ticketData;

    const query = `
      INSERT INTO support_tickets (user_id, subject, description, category, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [user_id, subject, description, category, priority];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating support ticket: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT * FROM support_tickets 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching user tickets: ${error.message}`);
    }
  }

  static async findById(id) {
    const query = `
      SELECT st.*, 
             u.username, u.email
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      WHERE st.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching ticket: ${error.message}`);
    }
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE support_tickets 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating ticket status: ${error.message}`);
    }
  }

  static async addMessage(ticketId, messageData) {
    const {
      user_id,
      message,
      is_admin = false
    } = messageData;

    const query = `
      INSERT INTO support_ticket_messages (ticket_id, user_id, message, is_admin)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [ticketId, user_id, message, is_admin];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error adding message: ${error.message}`);
    }
  }

  static async getMessages(ticketId) {
    const query = `
      SELECT stm.*, 
             u.username, u.avatar
      FROM support_ticket_messages stm
      JOIN users u ON stm.user_id = u.id
      WHERE stm.ticket_id = $1
      ORDER BY stm.created_at ASC
    `;

    try {
      const result = await pool.query(query, [ticketId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching messages: ${error.message}`);
    }
  }
}

module.exports = SupportTicket;
