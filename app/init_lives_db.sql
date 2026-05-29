-- sogyTweb Lives Tables
-- Add to existing database

-- Lives table
CREATE TABLE IF NOT EXISTS lives (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    stream_url VARCHAR(500) NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'live', -- live, ended
    viewer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

-- Live viewers table
CREATE TABLE IF NOT EXISTS live_viewers (
    id SERIAL PRIMARY KEY,
    live_id INTEGER REFERENCES lives(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(live_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lives_user ON lives(user_id);
CREATE INDEX IF NOT EXISTS idx_lives_status ON lives(status);
CREATE INDEX IF NOT EXISTS idx_lives_category ON lives(category);
CREATE INDEX IF NOT EXISTS idx_live_viewers_live ON live_viewers(live_id);
CREATE INDEX IF NOT EXISTS idx_live_viewers_user ON live_viewers(user_id);
