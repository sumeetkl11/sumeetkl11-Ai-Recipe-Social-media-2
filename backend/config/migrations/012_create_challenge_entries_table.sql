-- migration 012: Create challenge_entries table
-- Track user participation and progress in challenges
CREATE TABLE IF NOT EXISTS challenge_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipes_completed INT DEFAULT 0, -- How many recipes from the challenge they've cooked
  completed_at TIMESTAMP WITH TIME ZONE, -- When they finished the challenge (if completed)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id),
  CONSTRAINT valid_recipes_completed CHECK (recipes_completed >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_challenge_entries_challenge ON challenge_entries(challenge_id);
CREATE INDEX idx_challenge_entries_user ON challenge_entries(user_id);
CREATE INDEX idx_challenge_entries_completed ON challenge_entries(completed_at);
