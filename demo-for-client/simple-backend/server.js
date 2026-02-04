const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('../'));

const DATA_DIR = './data';
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function saveData(filename, data) {
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
}

function loadData(filename) {
    try {
        return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename)));
    } catch {
        return [];
    }
}

// Orders API
app.get('/api/orders', (req, res) => res.json(loadData('orders.json')));
app.post('/api/orders', (req, res) => {
    const orders = loadData('orders.json');
    orders.push(req.body);
    saveData('orders.json', orders);
    res.json({success: true, id: req.body.id});
});

// Reservations API
app.get('/api/reservations', (req, res) => res.json(loadData('reservations.json')));
app.post('/api/reservations', (req, res) => {
    const reservations = loadData('reservations.json');
    reservations.push(req.body);
    saveData('reservations.json', reservations);
    res.json({success: true, id: req.body.id});
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
    console.log('Customer app: http://localhost:3000/Customer Web App/index.html');
    console.log('Staff panel: http://localhost:3000/Staff Panel/index.html');
});