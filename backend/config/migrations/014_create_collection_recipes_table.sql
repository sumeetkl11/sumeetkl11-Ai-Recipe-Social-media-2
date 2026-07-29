-- migration 014: Create collection_recipes table
-- Map recipes to collections (many-to-many relationship)
CREATE TABLE IF NOT EXISTS collection_recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, recipe_id),
  CONSTRAINT valid_collection_recipe UNIQUE(collection_id, recipe_id)
);

-- Indexes for common queries
CREATE INDEX idx_collection_recipes_collection ON collection_recipes(collection_id);
CREATE INDEX idx_collection_recipes_recipe ON collection_recipes(recipe_id);
