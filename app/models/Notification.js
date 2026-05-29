const pool = require('../config/database');

class Notification {
  static async create(notificationData) {
    const {
      user_id,
      type,
      title,
      message,
      data = {},
      link = null
    } = notificationData;

    const query = `
      INSERT INTO notifications (user_id, type, title, message, data, link)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [user_id, type, title, message, JSON.stringify(data), link];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  static async findByUser(userId, limit = 20) {
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    try {
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  static async markAsRead(notificationId, userId) {
    const query = `
      UPDATE notifications 
      SET read = true, read_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [notificationId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET read = true, read_at = NOW()
      WHERE user_id = $1 AND read = false
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  static async getUnreadCount(userId) {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND read = false
    `;

    try {
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`Error getting unread count: ${error.message}`);
    }
  }
}

module.exports = Notification;
