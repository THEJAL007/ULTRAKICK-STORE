
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Serve Images (Crucial: This lets Render show your images)
app.use('/images', express.static(path.join(__dirname, 'images')));

// 3. Database Connection Logic
const isProduction = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : 'postgresql://postgres:thejal@20061892@localhost:5432/ULTRA KICK',
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// 4. API Routes
app.get('/api/jerseys', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jerseys ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jerseys" });
  }
});

app.get('/api/boots', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM boots ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch boots" });
  }
});

app.get('/api/balls', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM balls ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch balls" });
  }
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: "Connected!", time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ UltraKick Server Live on port ${port}`);
});
