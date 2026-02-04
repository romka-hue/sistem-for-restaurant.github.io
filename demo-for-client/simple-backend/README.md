# Simple Cross-Device Setup

## Quick Setup (5 minutes):

1. **Install Node.js** (if not installed)

2. **Setup server:**
```bash
cd simple-backend
npm install
npm start
```

3. **Access from any device on same network:**
- Customer: `http://YOUR_IP:3000/Customer Web App/index.html`
- Staff: `http://YOUR_IP:3000/Staff Panel/index.html`

## Find Your IP:
- Windows: `ipconfig` (look for IPv4)
- Example: `192.168.1.100`

## How It Works:
- **Orders/Reservations**: Saved to JSON files on server
- **Cart**: Still localStorage (personal to each customer)
- **Cross-device**: Customer orders → Staff sees immediately

## Replace Files:
To use API instead of localStorage, replace:
- `Customer Web App/website/script/cart.js` with `simple-backend/api-cart.js`
- Do same for reservations.js

## Real Restaurant Usage:
- **Staff computer**: Runs the server
- **Customer phones**: Connect to staff computer's IP
- **Works on same WiFi network**

This gives you real cross-device functionality with minimal setup!