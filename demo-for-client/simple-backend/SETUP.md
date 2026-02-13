# Database & Authentication Setup

## Quick Start (Local Development)

### 1. Install PostgreSQL
**Windows**: Download from https://www.postgresql.org/download/windows/

### 2. Create Database
```bash
psql -U postgres
CREATE DATABASE restaurant_db;
\q
```

### 3. Configure Environment
Copy `.env.example` to `.env` and update:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/restaurant_db
JWT_SECRET=change-this-to-random-string
```

### 4. Install & Run
```bash
npm install
npm start
```

## Deploy to Production (Free)

### Railway (Recommended)
1. Push code to GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Add PostgreSQL database (one click)
5. Set environment variables:
   - `JWT_SECRET`: Generate random string
   - Railway auto-sets `DATABASE_URL`
6. Deploy! Get URL like: `https://yourapp.railway.app`

### Render
1. Create PostgreSQL database (free tier)
2. Create Web Service from GitHub
3. Set environment variables
4. Deploy

## Authentication Flow

### Register User
```javascript
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "role": "customer"  // or "staff", "admin"
}
```

### Login
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
// Returns: { token: "jwt-token", user: {...} }
```

### Use Token
Add to requests:
```javascript
headers: {
  'Authorization': 'Bearer your-jwt-token'
}
```

## User Roles
- **customer**: Can create orders/reservations
- **staff**: Can view all orders/reservations
- **admin**: Full access

## Security Features
✅ Password hashing (bcrypt)
✅ JWT tokens (7-day expiry)
✅ Role-based access control
✅ SQL injection protection
✅ SSL for production database
