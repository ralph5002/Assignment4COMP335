// db.js - ONE shared connection to Postgres, used by app.js and the routes.
// It also creates the tables and fills them with starter data when the app starts,
// so you do NOT have to type SQL into psql by hand.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const url = process.env.DATABASE_URL || '';

const pool = new Pool({
  connectionString: url,
  // Render's public database address needs SSL; localhost does not.
  ssl: url.includes('render.com') ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => console.log('Database connection error:', err.message));

async function setupDatabase() {
  // 1. Make the two tables if they don't exist yet
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY, username text, password text, fullname text, prefer text)`);
  await pool.query(`CREATE TABLE IF NOT EXISTS car (
    equipID serial PRIMARY KEY, maker CHAR(10), model CHAR(20), year INT)`);

  // 2. Add the 'admin' user from the instructions (professor logs in with this one)
  const admin = await pool.query("SELECT 1 FROM users WHERE username = 'admin'");
  if (admin.rows.length === 0) {
    await pool.query(
      'INSERT INTO users (username, password, fullname, prefer) VALUES ($1, $2, $3, $4)',
      ['admin', '$2a$10$tXMKF036p0ZYIxF/cJEHauw/TFrcho4DXy41Kt12D3Lbnzr221hmK', 'Tim Berners-Lee', 'Prof']
    );
  }

  // 3. If the car table is empty, load it from car.txt
  const count = await pool.query('SELECT COUNT(*) FROM car');
  if (Number(count.rows[0].count) === 0) {
    const text = fs.readFileSync(path.join(__dirname, 'car.txt'), 'utf8');
    for (const line of text.trim().split('\n')) {
      const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      await pool.query(
        'INSERT INTO car (maker, model, year) VALUES ($1, $2, $3)',
        [cells[1].slice(0, 10), cells[2].slice(0, 20), parseInt(cells[3], 10)]
      );
    }
    console.log('Loaded car.txt into the car table');
  }
}

setupDatabase()
  .then(() => console.log('Database ready'))
  .catch((err) => console.log('Database setup failed:', err.message));

module.exports = pool;
