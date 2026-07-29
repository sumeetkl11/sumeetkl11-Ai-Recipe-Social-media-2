-- migration 013: Create collections table
-- User-created recipe collections (curated lists like "Meal Prep Favorites", "Quick Dinners")
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE, -- Can other users see and save this collection?
  recipe_count INT DEFAULT 0, -- Denormalized count
  save_count INT DEFAULT 0, -- How many users have saved this collection
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_is_public ON collections(is_public);
CREATE INDEX idx_collections_save_count ON collections(save_count DESC);
