import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const {Pool} = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:process.env.DATABASE_URL ? {
        rejectUnauthorized: false
    } : false
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('Running database migration...');

        // Read the schema file
        const schemaPath = path.join(__dirname, 'config', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Execute schema SQL directly
        await client.query(schemaSql);
        console.log(`\n✅ Database migration completed!`);
        console.log('\nTables available:');
        console.log('  - users');
        console.log('  - user_preferences');
        console.log('  - pantry_items');
        console.log('  - recipes');
        console.log('  - recipe_ingredients');
        console.log('  - recipe_nutrition');
        console.log('  - meal_plans');
        console.log('  - shopping_list_items');
        console.log('  - posts');
        console.log('  - comments');
        console.log('  - likes');
        console.log('  - notifications');
        console.log('  - conversations');
        console.log('  - messages');
        console.log('  - collections');
        console.log('  - collection_items');
        console.log('  - challenges');
        console.log('  - challenge_entries');
        console.log('  - follows');
        console.log('  - user_profiles');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
