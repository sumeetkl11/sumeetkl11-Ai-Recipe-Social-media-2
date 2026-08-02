import { pool } from './config/db.js';

async function checkSchema() {
    try {
        console.log('Checking posts table schema...');
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'posts' 
            ORDER BY ordinal_position
        `);
        console.log('Posts table columns:');
        console.table(result.rows);
        
        console.log('\nChecking follows table schema...');
        const followsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'follows' 
            ORDER BY ordinal_position
        `);
        console.log('Follows table columns:');
        console.table(followsResult.rows);
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
        await pool.end();
        process.exit(1);
    }
}

checkSchema();
