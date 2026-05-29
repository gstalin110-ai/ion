const pool = require('../config/database');

class Friendship {
  static async create(userId, friendId) {
    const query = `
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [userId, friendId]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Friendship already exists');
      }
      throw new Error(`Error creating friendship: ${error.message}`);
    }
  }

  static async acceptRequest(userId, friendId) {
    const query = `
      UPDATE friendships 
      SET status = 'accepted', updated_at = NOW()
      WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [friendId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error accepting friendship: ${error.message}`);
    }
  }

  static async rejectRequest(userId, friendId) {
    const query = `
      DELETE FROM friendships 
      WHERE user_id = $1 AND friend_id = $2 AND status = 'pending'
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [friendId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error rejecting friendship: ${error.message}`);
    }
  }

  static async removeFriend(userId, friendId) {
    const query = `
      DELETE FROM friendships 
      WHERE ((user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))
      AND status = 'accepted'
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [userId, friendId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error removing friend: ${error.message}`);
    }
  }

  static async getFriends(userId) {
    const query = `
      SELECT u.id, u.username, u.avatar, u.rating,
             f.created_at as friends_since
      FROM friendships f
      JOIN users u ON (
        CASE 
          WHEN f.user_id = $1 THEN f.friend_id = u.id
          ELSE f.user_id = u.id
        END
      )
      WHERE (f.user_id = $1 OR f.friend_id = $1)
      AND f.status = 'accepted'
      ORDER BY f.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching friends: ${error.message}`);
    }
  }

  static async getPendingRequests(userId) {
    const query = `
      SELECT u.id, u.username, u.avatar, u.rating,
             f.created_at as request_date
      FROM friendships f
      JOIN users u ON f.user_id = u.id
      WHERE f.friend_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching pending requests: ${error.message}`);
    }
  }

  static async checkFriendship(userId1, userId2) {
    const query = `
      SELECT status, user_id, friend_id
      FROM friendships
      WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)
    `;

    try {
      const result = await pool.query(query, [userId1, userId2]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error checking friendship: ${error.message}`);
    }
  }
}

module.exports = Friendship;
