-- Migration: Create conversations table
-- Enables DM conversations between users

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_one_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_two_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_one_id, user_two_id),
    CHECK (user_one_id != user_two_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_one_id ON conversations(user_one_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_two_id ON conversations(user_two_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
