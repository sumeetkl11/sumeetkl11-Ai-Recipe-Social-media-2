import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false
    } : false
});

async function fixMealPlanTable() {
    const client = await pool.connect();

    try {
        console.log('Checking meal_plans table structure...');

        // Check current columns
        const columnsResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'meal_plans' 
            ORDER BY ordinal_position
        `);

        console.log('Current columns in meal_plans:');
        columnsResult.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });

        // Check if meal_date exists
        const hasMealDate = columnsResult.rows.some(col => col.column_name === 'meal_date');

        if (!hasMealDate) {
            console.log('❌ meal_date column missing. Adding it...');
            
            // Add meal_date column
            await client.query(`
                ALTER TABLE meal_plans 
                ADD COLUMN meal_date DATE NOT NULL DEFAULT CURRENT_DATE
            `);
            
            console.log('✅ meal_date column added successfully!');
        } else {
            console.log('✅ meal_date column already exists');
        }

        // Check if we need to update any existing records
        if (!hasMealDate) {
            console.log('Updating existing records...');
            await client.query(`
                UPDATE meal_plans 
                SET meal_date = CURRENT_DATE 
                WHERE meal_date IS NULL
            `);
            console.log('✅ Existing records updated');
        }

        // Show final structure
        const finalResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'meal_plans' 
            ORDER BY ordinal_position
        `);

        console.log('\nFinal meal_plans table structure:');
        finalResult.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });

    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

fixMealPlanTable();
