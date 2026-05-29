const pool = require('../config/database');

class AIPreference {
  static async findByUser(userId) {
    const query = `
      SELECT * FROM ai_preferences WHERE user_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching AI preferences: ${error.message}`);
    }
  }

  static async createOrUpdate(userId, preferenceData) {
    const {
      voice_type = 'female',
      voice_speed = 1.0,
      language = 'es',
      personality = 'professional',
      automation_enabled = false,
      auto_responses = false
    } = preferenceData;

    const query = `
      INSERT INTO ai_preferences (
        user_id, voice_type, voice_speed, language, 
        personality, automation_enabled, auto_responses
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        voice_type = EXCLUDED.voice_type,
        voice_speed = EXCLUDED.voice_speed,
        language = EXCLUDED.language,
        personality = EXCLUDED.personality,
        automation_enabled = EXCLUDED.automation_enabled,
        auto_responses = EXCLUDED.auto_responses,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      userId, voice_type, voice_speed, language,
      personality, automation_enabled, auto_responses
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating AI preferences: ${error.message}`);
    }
  }

  static async update(userId, updateData) {
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
      UPDATE ai_preferences 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    values.push(userId);

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating AI preferences: ${error.message}`);
    }
  }
}

module.exports = AIPreference;
