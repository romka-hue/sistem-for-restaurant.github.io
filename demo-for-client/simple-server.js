// Simple file-based server (no database needed)
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = './data';
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Save to JSON file
function saveData(filename, data) {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

// Load from JSON file
function loadData(filename) {
    try {
        return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename)));
    } catch {
        return [];
    }
}

// Orders
app.get('/api/orders', (req, res) => res.json(loadData('orders.json')));
app.post('/api/orders', (req, res) => {
    const orders = loadData('orders.json');
    orders.push(req.body);
    saveData('orders.json', orders);
    res.json({success: true});
});

// Reservations  
app.get('/api/reservations', (req, res) => res.json(loadData('reservations.json')));
app.post('/api/reservations', (req, res) => {
    const reservations = loadData('reservations.json');
    reservations.push(req.body);
    saveData('reservations.json', reservations);
    res.json({success: true});
});

app.listen(3000, () => console.log('Server running on port 3000'));

// Package.json needed:
// {"dependencies": {"express": "^4.18.2", "cors": "^2.8.5"}}