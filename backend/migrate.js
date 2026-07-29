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

        // Better SQL splitting that handles multiline statements
        const statements = [];
        let currentStatement = '';
        let inDollarQuote = false;
        let dollarQuoteDelim = '';
        
        const lines = schemaSql.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip comments and empty lines
            if (!trimmedLine || trimmedLine.startsWith('--') || trimmedLine.startsWith('/*')) {
                if (currentStatement) currentStatement += '\n' + line;
                continue;
            }
            
            // Check for dollar quotes
            const dollarRegex = /\$\w*\$/g;
            let match;
            while ((match = dollarRegex.exec(trimmedLine)) !== null) {
                const delim = match[0];
                if (inDollarQuote && dollarQuoteDelim === delim) {
                    inDollarQuote = false;
                    dollarQuoteDelim = '';
                } else if (!inDollarQuote) {
                    inDollarQuote = true;
                    dollarQuoteDelim = delim;
                }
            }
            
            currentStatement += (currentStatement ? '\n' : '') + line;
            
            // Check for statement end (semicolon not in dollar quote)
            if (!inDollarQuote && trimmedLine.endsWith(';')) {
                statements.push(currentStatement.trim());
                currentStatement = '';
            }
        }
        
        // Add any remaining statement
        if (currentStatement.trim()) {
            statements.push(currentStatement.trim());
        }

        let successCount = 0;
        let warningCount = 0;

        for (const statement of statements) {
            try {
                if (statement.trim()) {
                    await client.query(statement);
                    successCount++;
                }
            } catch (stmtError) {
                // Ignore errors for objects that already exist or relations that don't exist yet
                if (stmtError.code === '42P07' || // relation already exists
                    stmtError.code === '42701' || // column already exists  
                    stmtError.code === '42703' || // column does not exist
                    stmtError.code === '42710' || // trigger already exists
                    stmtError.code === '42P02' || // index does not exist
                    stmtError.message.includes('already exists')) {
                    warningCount++;
                    // Silently skip
                } else {
                    console.error(`❌ Error in statement:`);
                    console.error(`   ${statement.substring(0, 100).replace(/\n/g, ' ')}...`);
                    console.error(`   ${stmtError.message}`);
                    warningCount++;
                }
            }
        }

        console.log(`\n✅ Database migration completed!`);
        console.log(`   Executed: ${successCount} statements`);
        console.log(`   Skipped/Warnings: ${warningCount} statements`);
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
