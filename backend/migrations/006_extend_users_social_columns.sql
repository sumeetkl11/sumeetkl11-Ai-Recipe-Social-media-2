-- Migration: Extend users table with social columns
-- Adds denormalized counts for performance and profile fields

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS follower_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recipe_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_cooked_at TIMESTAMPTZ;

-- Create index for profile queries
CREATE INDEX IF NOT EXISTS idx_users_follower_count ON users(follower_count DESC);
