-- migration 015: Create cook_sessions table
-- Live cooking event sessions where users cook together in real-time
CREATE TABLE IF NOT EXISTS cook_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  current_step INT DEFAULT 0,
  total_steps INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed
  participant_count INT DEFAULT 1, -- Denormalized for quick queries
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'completed'))
);

-- Indexes for common queries
CREATE INDEX idx_cook_sessions_host ON cook_sessions(host_id);
CREATE INDEX idx_cook_sessions_recipe ON cook_sessions(recipe_id);
CREATE INDEX idx_cook_sessions_status ON cook_sessions(status);
CREATE INDEX idx_cook_sessions_participant_count ON cook_sessions(participant_count DESC);
