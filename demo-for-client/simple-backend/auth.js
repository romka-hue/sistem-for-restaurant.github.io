const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { pool } = require('./db');

async function register(email, password, role = 'customer') {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
        [email, hash, role]
    );
    return result.rows[0];
}

async function login(email, password) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) throw new Error('Invalid credentials');
    
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
}

function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
        next();
    };
}

module.exports = { register, login, verifyToken, requireRole };
