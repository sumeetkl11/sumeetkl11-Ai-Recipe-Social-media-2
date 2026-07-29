-- migration 016: Create grocery_lists table
-- Shared shopping lists for users and groups
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  item_count INT DEFAULT 0, -- Denormalized
  completed_item_count INT DEFAULT 0, -- Denormalized
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_grocery_lists_owner ON grocery_lists(owner_id);
CREATE INDEX idx_grocery_lists_is_shared ON grocery_lists(is_shared);

-- migration 017: Create list_items table
-- Individual items in grocery lists
CREATE TABLE IF NOT EXISTS list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES grocery_lists(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 1,
  unit VARCHAR(50), -- kg, lbs, pieces, etc
  is_checked BOOLEAN DEFAULT FALSE,
  checked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_list_items_list ON list_items(list_id);
CREATE INDEX idx_list_items_is_checked ON list_items(is_checked);
