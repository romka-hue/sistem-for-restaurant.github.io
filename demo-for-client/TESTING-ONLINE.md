# Testing Online Before Real Deployment

## 🎯 Goal: Let restaurant staff test your system from their phones/computers

## Option 1: ngrok (RECOMMENDED - Easiest)

### Setup (One time):
1. Go to https://ngrok.com/download
2. Download and extract ngrok
3. Sign up (free) and get auth token
4. Run: `ngrok authtoken YOUR_TOKEN`

### Every time you want to share:
1. Start your server:
   ```bash
   cd demo-for-client/simple-backend
   node server.js
   ```

2. In NEW terminal, run:
   ```bash
   ngrok http 3000
   ```

3. You'll see:
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```

4. Share these URLs:
   - Customer: `https://abc123.ngrok.io/Customer%20Web%20App/website/index.html`
   - Staff: `https://abc123.ngrok.io/Staff%20Panel/index.html`
   - Admin: `https://abc123.ngrok.io/Admin%20Dashboard/index.html`

### Update your code:
In all your JavaScript files, replace:
```javascript
fetch('http://localhost:3000/api/orders', ...)
```
With:
```javascript
fetch('https://abc123.ngrok.io/api/orders', ...)
```

OR use the config.js file I created!

---

## Option 2: LocalTunnel (No signup needed)

### Setup:
```bash
npm install -g localtunnel
```

### Run:
```bash
cd demo-for-client/simple-backend
node server.js
```

In new terminal:
```bash
lt --port 3000
```

You get: `https://random-name.loca.lt`

---

## Option 3: Same WiFi Network (Restaurant testing)

### Find your IP:
**Windows:**
```bash
ipconfig
```
Look for: `IPv4 Address: 192.168.1.5`

**Mac/Linux:**
```bash
ifconfig
```

### Share with staff:
- Customer: `http://192.168.1.5:3000/Customer%20Web%20App/website/index.html`
- Staff: `http://192.168.1.5:3000/Staff%20Panel/index.html`

**Note:** Everyone must be on same WiFi!

---

## Using config.js (Smart way)

1. Add to your HTML files (before other scripts):
   ```html
   <script src="../../config.js"></script>
   ```

2. In your JavaScript, use:
   ```javascript
   fetch(`${window.API_URL}/api/orders`, ...)
   ```

3. Change mode in config.js:
   ```javascript
   CURRENT: 'LOCAL'   // For testing on your PC
   CURRENT: 'WIFI'    // For restaurant WiFi testing
   CURRENT: 'ONLINE'  // For ngrok/internet testing
   ```

---

## Testing Checklist:

### Local Testing (Your PC):
- [ ] Customer can browse menu
- [ ] Customer can add to cart
- [ ] Customer can checkout
- [ ] Staff sees new orders
- [ ] Staff can update order status
- [ ] Admin sees statistics

### WiFi Testing (Same network):
- [ ] Staff phone can access staff panel
- [ ] Orders sync between devices
- [ ] Multiple staff can work simultaneously

### Online Testing (ngrok):
- [ ] Works from anywhere
- [ ] Works on mobile data
- [ ] Multiple locations can connect

---

## Important Notes:

**ngrok free limitations:**
- URL changes every time you restart
- Session expires after 2 hours
- Need to update URLs in code each time

**For permanent solution:**
- Buy domain ($10/year)
- Use hosting (AWS, DigitalOcean, Heroku)
- Get SSL certificate (free with Let's Encrypt)

**Security for testing:**
- ngrok URLs are random and hard to guess
- Don't share URLs publicly
- Only share with restaurant staff
- Stop ngrok when not testing

---

## Quick Start (Right Now):

1. **Install ngrok:**
   - Download from https://ngrok.com/download
   - Extract to any folder

2. **Start server:**
   ```bash
   cd demo-for-client/simple-backend
   node server.js
   ```

3. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the https URL** (like https://abc123.ngrok.io)

5. **Update config.js:**
   ```javascript
   ONLINE: 'https://abc123.ngrok.io',
   CURRENT: 'ONLINE'
   ```

6. **Share the URLs with restaurant!**

---

## Troubleshooting:

**"This site can't be reached"**
- Make sure server is running (`node server.js`)
- Make sure ngrok is running
- Check if URL is correct

**"CORS error"**
- Already fixed in server.js with `app.use(cors())`

**"Connection refused"**
- Firewall might be blocking
- Try different port: `ngrok http 3001`

**ngrok URL changes**
- Free version gives new URL each time
- Upgrade to paid ($8/month) for permanent URL
- Or use config.js to change URL easily
