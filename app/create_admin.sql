-- sogyTweb - Crear Usuario Admin Inicial
-- Ejecutar este script después de init_db.sql y init_admin_db.sql

-- Crear usuario admin (cambiar la contraseña en producción)
INSERT INTO users (username, email, password, is_admin, is_verified, is_seller)
VALUES (
    'admin',
    'admin@sogytweb.com',
    '$2a$10$YourHashedPasswordHere', -- Usar bcrypt para generar el hash
    TRUE,
    TRUE,
    TRUE
)
ON CONFLICT (username) DO NOTHING;

-- Para generar el hash de contraseña, puedes usar Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hash('tu_contraseña', 10);
-- console.log(hash);

-- Ejemplo para contraseña "admin123":
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
