const pool = require('../config/database');

class Message {
  static async create(messageData) {
    const {
      sender_id,
      receiver_id,
      content,
      message_type = 'text', // text, image, video, audio, file, product, location
      media_url = null,
      product_id = null,
      location_data = null,
      is_read = false
    } = messageData;

    const query = `
      INSERT INTO messages (
        sender_id, receiver_id, content, message_type, 
        media_url, product_id, location_data, is_read
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      sender_id, receiver_id, content, message_type,
      media_url, product_id, location_data, is_read
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }
  }

  static async getConversation(userId1, userId2, limit = 50, offset = 0) {
    const query = `
      SELECT m.*, 
             u1.username as sender_name, u1.avatar as sender_avatar,
             u2.username as receiver_name, u2.avatar as receiver_avatar
      FROM messages m
      JOIN users u1 ON m.sender_id = u1.id
      JOIN users u2 ON m.receiver_id = u2.id
      WHERE ((m.sender_id = $1 AND m.receiver_id = $2) 
             OR (m.sender_id = $2 AND m.receiver_id = $1))
      ORDER BY m.created_at DESC
      LIMIT $3 OFFSET $4
    `;

    try {
      const result = await pool.query(query, [userId1, userId2, limit, offset]);
      return result.rows.reverse();
    } catch (error) {
      throw new Error(`Error fetching conversation: ${error.message}`);
    }
  }

  static async getConversations(userId) {
    const query = `
      SELECT DISTINCT
        CASE 
          WHEN sender_id = $1 THEN receiver_id 
          ELSE sender_id 
        END as other_user_id,
        u.username, u.avatar, u.rating,
        m.content as last_message,
        m.created_at as last_message_time,
        m.message_type,
        COUNT(CASE WHEN receiver_id = $1 AND is_read = false THEN 1 END) as unread_count
      FROM messages m
      JOIN users u ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.receiver_id = u.id
          ELSE m.sender_id = u.id
        END
      )
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      GROUP BY 
        CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END,
        u.username, u.avatar, u.rating, m.content, m.created_at, m.message_type
      ORDER BY m.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching conversations: ${error.message}`);
    }
  }

  static async markAsRead(senderId, receiverId) {
    const query = `
      UPDATE messages 
      SET is_read = true, read_at = NOW()
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [senderId, receiverId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error marking messages as read: ${error.message}`);
    }
  }

  static async delete(messageId) {
    const query = `DELETE FROM messages WHERE id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [messageId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting message: ${error.message}`);
    }
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM messages
      WHERE receiver_id = $1 AND is_read = false
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0].count;
    } catch (error) {
      throw new Error(`Error fetching unread count: ${error.message}`);
    }
  }
}

module.exports = Message;
