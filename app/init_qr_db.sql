-- sogyTweb Order QR Codes Table
-- Add to existing database

-- Order QR codes table
CREATE TABLE IF NOT EXISTS order_qr_codes (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    qr_code VARCHAR(500) NOT NULL UNIQUE,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    scanned BOOLEAN DEFAULT FALSE,
    scanned_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_qr_order ON order_qr_codes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_qr_user ON order_qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_order_qr_code ON order_qr_codes(qr_code);
CREATE INDEX IF NOT EXISTS idx_order_qr_expires ON order_qr_codes(expires_at);
