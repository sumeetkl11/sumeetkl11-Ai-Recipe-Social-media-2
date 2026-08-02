import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL;

const poolConfig = {
    // Connection pool configuration for production readiness
    max: 20, // Maximum number of clients in pool
    min: 2, // Minimum number of clients in pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return error after 10 seconds if connection can't be established (increased from 2s to handle concurrent requests)
    maxUses: 7500, // Close & replace connection after 7500 uses
    // Add query timeout to prevent queries from holding connections indefinitely
    query_timeout: 30000, // 30 second query timeout
};

if (connectionString) {
    poolConfig.connectionString = connectionString;
    if (process.env.NODE_ENV === 'production' || connectionString.includes('sslmode=require') || connectionString.includes('neon.tech')) {
        poolConfig.ssl = { rejectUnauthorized: false };
    }
} else {
    poolConfig.host = process.env.PGHOST || 'localhost';
    poolConfig.port = process.env.PGPORT || 5432;
    poolConfig.user = process.env.PGUSER || 'postgres';
    poolConfig.password = process.env.PGPASSWORD || '';
    poolConfig.database = process.env.PGDATABASE || 'tastebuds';
}

const pool = new Pool(poolConfig);

// Log pool errors
pool.on('error', (err, client) => {
    console.error('[DB Pool] Unexpected error on idle client:', {
        error: err.message,
        code: err.code,
        // Only log full stack in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing database pool...');
    await pool.end();
    process.exit(0);
});

export { pool };

export const initDB = async () => {
    console.log('[DB] Starting database initialization...');
    
    try {
        // Test database connection first
        const connectionTest = await pool.query('SELECT NOW() as current_time');
        console.log('[DB] ✅ Database connection successful:', connectionTest.rows[0].current_time);
        
        // Check if critical tables exist
        const tablesCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'recipes', 'pantry_items', 'meal_plans', 'posts', 'follows')
            ORDER BY table_name
        `);
        console.log('[DB] Existing tables:', tablesCheck.rows.map(r => r.table_name).join(', '));
        
        // ensure the users table has a name column (migrations are minimal)
        console.log('[DB] Altering users table...');
        await pool.query(
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT ''`);
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS bio TEXT,
            ADD COLUMN IF NOT EXISTS avatar_url TEXT,
            ADD COLUMN IF NOT EXISTS follower_count INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0
        `);
        console.log('[DB] ✅ Users table updated');
        
        console.log('[DB] Altering posts table...');
        await pool.query(
            `ALTER TABLE posts ALTER COLUMN recipe_id DROP NOT NULL`
        );
        console.log('[DB] ✅ Posts table updated');
        
        console.log('[DB] Altering conversations table...');
        await pool.query(`
            ALTER TABLE conversations
            ADD COLUMN IF NOT EXISTS user_one_id UUID REFERENCES users(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS user_two_id UUID REFERENCES users(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW()
        `);
        await pool.query(`
            UPDATE conversations
            SET
              user_one_id = COALESCE(user_one_id, participant_1_id),
              user_two_id = COALESCE(user_two_id, participant_2_id),
              last_message_at = COALESCE(last_message_at, updated_at, created_at, NOW())
            WHERE user_one_id IS NULL OR user_two_id IS NULL OR last_message_at IS NULL
        `);
        console.log('[DB] ✅ Conversations table updated');
        
        console.log('[DB] Altering messages table...');
        await pool.query(`
            ALTER TABLE messages
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
        `);
        console.log('[DB] ✅ Messages table updated');
        
        console.log('[DB] Creating conversation indices...');
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_user_pair_unique
            ON conversations(user_one_id, user_two_id)
        `);
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_user_pair_unique_rev
            ON conversations(user_two_id, user_one_id)
        `);
        console.log('[DB] ✅ Conversation indices created');
        
        // Marketplace & Shopping system tables
        console.log('[DB] Creating marketplace tables...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS marketplace_listings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                price DECIMAL(10, 2) NOT NULL,
                condition VARCHAR(50),
                image_url TEXT,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS purchases (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
                item_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
                seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
                quantity INT DEFAULT 1,
                price DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'completed',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS wishlists (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                visibility VARCHAR(20) DEFAULT 'private',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS wishlist_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
                product_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
                price_tracked DECIMAL(10, 2),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(wishlist_id, product_id)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
                target_id UUID NOT NULL,
                target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('user', 'product')),
                rating INT CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('[DB] ✅ Marketplace tables created');

        console.log('[DB] ✅ Database schema validated successfully');
    } catch (err) {
        console.error('[DB] ❌ Error during database initialization:', {
            error: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint,
            table: err.table,
            column: err.column,
            constraint: err.constraint,
            stack: err.stack
        });
        throw err; // Re-throw to prevent server from starting with broken DB
    }
};

export default {
    query: (text, param) => pool.query(text, param),
    pool
};
