const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Serve Images (This allows the browser to see the files in your 'images' folder)
app.use('/images', express.static(path.join(__dirname, 'images')));

// 3. Setup the Connection to your PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ULTRA KICK', // Ensure this matches exactly in pgAdmin
  password: 'thejal@20061892', 
  port: 5432,
});

// 4. API Routes (Mapping to your 3 specific tables)

// GET Jerseys from the 'jerseys' table
app.get('/api/jerseys', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jerseys ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jerseys" });
  }
});

// GET Boots from the 'boots' table
app.get('/api/boots', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM boots ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch boots" });
  }
});

// GET Balls from the 'balls' table
app.get('/api/balls', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM balls ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch balls" });
  }
});

// 5. Connection Test Route
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: "Connected!", time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

// 6. Start the server
app.listen(port, () => {
  console.log(`
  ✅ UltraKick Server is Live!
  ----------------------------
  Base URL: http://localhost:${port}
  Database: ULTRA KICK
  ----------------------------
  `);
});