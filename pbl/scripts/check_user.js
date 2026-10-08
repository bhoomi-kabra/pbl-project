const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const r = await pool.query("SELECT * FROM users WHERE email='bhoomikabra12@gmail.com'");
  console.log('User in DB:', r.rows);
  await pool.end();
}
run();
