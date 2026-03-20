const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Serve Images (This allows Render to show your photos)
app.use('/images', express.static(path.join(__dirname, 'images')));

// 3. Database Connection
const isProduction = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : 'postgresql://postgres:thejal@2026@localhost:5432/ultrakick',
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

// 4. API Endpoints
app.get('/api/jerseys', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jerseys');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch jerseys" });
    }
});

app.get('/api/boots', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM boots');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch boots" });
    }
});

app.get('/api/balls', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM balls');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch balls" });
    }
});

// 5. Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
