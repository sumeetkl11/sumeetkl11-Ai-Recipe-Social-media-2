import { pool } from './config/db.js';

(async () => {
  try {
    console.log('Fixing follows table index...');
    
    // Drop incorrect index if it exists
    await pool.query('DROP INDEX IF EXISTS idx_follows_following_id');
    console.log('✓ Dropped incorrect index (if it existed)');
    
    // Ensure correct index exists
    await pool.query('CREATE INDEX IF NOT EXISTS idx_follows_followee_id ON follows(followee_id)');
    console.log('✓ Ensured correct index exists');
    
    // Verify column names
    const result = await pool.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'follows' 
       AND column_name IN ('followee_id', 'following_id')`
    );
    console.log('✓ Follows table columns:', result.rows.map(r => r.column_name));
    
    // Verify index exists
    const indexResult = await pool.query(
      `SELECT indexname 
       FROM pg_indexes 
       WHERE tablename = 'follows' 
       AND indexname LIKE 'idx_follows_%'`
    );
    console.log('✓ Follows table indexes:', indexResult.rows.map(r => r.indexname));
    
    await pool.end();
    console.log('\n✅ Database schema fix complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
