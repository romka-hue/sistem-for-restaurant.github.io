// Copyright (c) 2026 Roman
// Licensed under the GNU Affero General Public License v3.0

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');
const { register, login, verifyToken, requireRole } = require('./auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../'));

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
    try {
        const user = await register(req.body.email, req.body.password, req.body.role);
        res.json({ success: true, user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const result = await login(req.body.email, req.body.password);
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

// Orders API
app.get('/api/orders', verifyToken, requireRole('staff', 'admin'), async (req, res) => {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
});

app.post('/api/orders', async (req, res) => {
    try {
        const { items, total, customer_name, customer_email, customer_phone } = req.body;
        const user_id = req.user?.id || null;
        const result = await pool.query(
            'INSERT INTO orders (user_id, items, total, customer_name, customer_email, customer_phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [user_id, JSON.stringify(items), total, customer_name, customer_email, customer_phone]
        );
        res.json({ success: true, order: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Reservations API
app.get('/api/reservations', verifyToken, requireRole('staff', 'admin'), async (req, res) => {
    const result = await pool.query('SELECT * FROM reservations ORDER BY date, time');
    res.json(result.rows);
});

app.post('/api/reservations', async (req, res) => {
    try {
        const { name, email, phone, date, time, guests } = req.body;
        const user_id = req.user?.id || null;
        const result = await pool.query(
            'INSERT INTO reservations (user_id, name, email, phone, date, time, guests) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [user_id, name, email, phone, date, time, guests]
        );
        res.json({ success: true, reservation: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Customer app: http://localhost:' + PORT + '/Customer%20Web%20App/website/index.html');
        console.log('Staff panel: http://localhost:' + PORT + '/Staff%20Panel/index.html');
    });
}).catch(err => console.error('DB init failed:', err));