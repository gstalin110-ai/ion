const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrations() {
  const sqlFiles = [
    'init_db.sql',
    'init_social_db.sql',
    'init_ai_db.sql',
    'init_finance_db.sql',
    'init_admin_db.sql',
    'init_lives_db.sql',
    'init_stories_db.sql',
    'init_groups_db.sql',
    'init_qr_db.sql',
    'init_notifications_db.sql',
    'init_support_db.sql',
    'init_profile_db.sql',
    'init_bookmarks_db.sql'
  ];

  console.log('🔄 Ejecutando migraciones...');

  for (const file of sqlFiles) {
    try {
      const sqlPath = path.join(__dirname, '..', file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      await pool.query(sql);
      console.log(`✅ ${file} ejecutado`);
    } catch (error) {
      console.error(`❌ Error ejecutando ${file}:`, error.message);
    }
  }

  console.log('🎉 Migraciones completadas');
  process.exit();
}

runMigrations();
