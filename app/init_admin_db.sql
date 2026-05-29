-- sogyTweb Admin System Tables
-- Add to existing database

-- System Config table
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    commission_rate DECIMAL(5, 2) DEFAULT 5.00,
    min_withdrawal DECIMAL(15, 2) DEFAULT 10.00,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default config
INSERT INTO system_config (id, commission_rate, min_withdrawal)
VALUES (1, 5.00, 10.00)
ON CONFLICT (id) DO NOTHING;

-- Update users table to add admin fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create admin user (password: admin123 - should be changed immediately)
-- This is a placeholder - in production, create admin through secure method
UPDATE users SET is_admin = TRUE WHERE username = 'admin';

-- Trigger for system_config
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
