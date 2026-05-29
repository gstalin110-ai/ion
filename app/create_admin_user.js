const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function createAdminUser() {
  const adminData = {
    username: 'admin',
    email: 'admin@sogytweb.com',
    password: 'admin123', // Cambiar esto en producción
    is_admin: true,
    is_verified: true,
    is_seller: true
  };

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    // Check if admin already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [adminData.username, adminData.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  El usuario admin ya existe');
      
      // Update to admin if not already
      await pool.query(
        'UPDATE users SET is_admin = TRUE, is_verified = TRUE, is_seller = TRUE WHERE username = $1',
        [adminData.username]
      );
      console.log('✅ Usuario actualizado a admin');
      return;
    }

    // Create admin user
    const query = `
      INSERT INTO users (username, email, password, is_admin, is_verified, is_seller)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, is_admin
    `;

    const values = [
      adminData.username,
      adminData.email,
      hashedPassword,
      adminData.is_admin,
      adminData.is_verified,
      adminData.is_seller
    ];

    const result = await pool.query(query, values);
    console.log('✅ Usuario admin creado exitosamente:');
    console.log('   Username:', result.rows[0].username);
    console.log('   Email:', result.rows[0].email);
    console.log('   Password:', adminData.password);
    console.log('   Is Admin:', result.rows[0].is_admin);
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña en producción');
    
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error.message);
  } finally {
    process.exit();
  }
}

createAdminUser();
