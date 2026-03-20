const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// LOCAL DATABASE CONNECTION
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ultrakick', 
    password: 'thejal@20061892', 
    port: 5432,
});

// API Routes
app.get('/api/jerseys', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jerseys');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/boots', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM boots');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/balls', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM balls');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
