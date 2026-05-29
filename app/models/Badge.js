const pool = require('../config/database');

class Badge {
  static async create(badgeData) {
    const {
      user_id,
      badge_type,
      badge_name,
      badge_description,
      badge_icon
    } = badgeData;

    const query = `
      INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, badge_type) DO NOTHING
      RETURNING *
    `;

    const values = [user_id, badge_type, badge_name, badge_description, badge_icon];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating badge: ${error.message}`);
    }
  }

  static async findByUser(userId) {
    const query = `
      SELECT * FROM user_badges 
      WHERE user_id = $1
      ORDER BY earned_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching badges: ${error.message}`);
    }
  }

  static async checkAndAward(userId, badgeType, badgeData) {
    const existing = await pool.query(
      'SELECT id FROM user_badges WHERE user_id = $1 AND badge_type = $2',
      [userId, badgeType]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    return await Badge.create({
      user_id: userId,
      badge_type: badgeType,
      ...badgeData
    });
  }

  static async getBadgeDefinitions() {
    const badges = [
      {
        type: 'early_adopter',
        name: 'Pionero',
        description: 'Uno de los primeros 1000 usuarios',
        icon: '🚀'
      },
      {
        type: 'top_seller',
        name: 'Vendedor Élite',
        description: 'Más de 100 ventas exitosas',
        icon: '💎'
      },
      {
        type: 'social_butterfly',
        name: 'Mariposa Social',
        description: 'Más de 1000 seguidores',
        icon: '🦋'
      },
      {
        type: 'content_creator',
        name: 'Creador de Contenido',
        description: 'Más de 100 publicaciones',
        icon: '🎨'
      },
      {
        type: 'verified',
        name: 'Verificado',
        description: 'Cuenta verificada',
        icon: '✓'
      },
      {
        type: 'affiliate_master',
        name: 'Maestro Afiliado',
        description: 'Más de 100 conversiones de afiliados',
        icon: '💰'
      },
      {
        type: 'live_streamer',
        name: 'Streamer',
        description: 'Más de 10 lives realizados',
        icon: '📺'
      },
      {
        type: 'story_teller',
        name: 'Narrador',
        description: 'Más de 50 stories publicados',
        icon: '📖'
      }
    ];

    return badges;
  }
}

module.exports = Badge;
