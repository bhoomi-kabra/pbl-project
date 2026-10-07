const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connected to:', (process.env.DATABASE_URL || '').split('@')[1]);
    const res = await pool.query('SELECT * FROM tickets LIMIT 10;');
    console.log('Tickets count:', res.rowCount);
    console.log('Tickets sample:', res.rows);
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    await pool.end();
  }
}

run();
