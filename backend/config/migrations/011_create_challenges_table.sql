-- migration 011: Create challenges table
-- Recipes grouped into themed challenges (e.g., "30-Minute Dinners", "Vegan Challenge")
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  recipe_ids UUID[] DEFAULT ARRAY[]::UUID[], -- Array of recipe IDs to participate
  participant_count INT DEFAULT 0, -- Denormalized for leaderboard
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_challenge_dates CHECK (end_date > start_date)
);

-- Index for common queries
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX idx_challenges_created_by ON challenges(created_by);
CREATE INDEX idx_challenges_participant_count ON challenges(participant_count DESC);
