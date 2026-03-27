# Campus Lost & Found - Setup Guide

## Overview
This guide will help you set up the Campus Lost & Found application with MongoDB backend and admin dashboard.

## Prerequisites
- Node.js (v16+)
- npm, yarn, pnpm, or bun
- MongoDB (local or Atlas cloud)

## Setup Instructions

### 1. MongoDB Setup

#### Option A: Local MongoDB (Recommended for Development)

**For Windows/Mac with Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**For Windows (Direct Install):**
- Download from https://www.mongodb.com/try/download/community
- Run the installer and follow the wizard
- MongoDB will typically start automatically

**For Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**For Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Create a database user with password
5. Get your connection string
6. Update `.env.local` in the backend folder with the connection string

### 2. Backend Setup

```bash
# Install backend dependencies
cd backend
npm install

# The backend will automatically use .env.local if it exists
# Default connection string (local MongoDB):
# MONGODB_URI=mongodb://localhost:27017/campus-lost-found
```

### 3. Seed the Database with Sample Data

```bash
# From the backend folder
npm run seed

# This will add sample items to your database:
# - 2 Lost items (pending verification)
# - 2 Found items (verified)
# - 1 Recovered item
# - 1 Lost item (pending verification)
```

### 4. Start the Backend Server

```bash
# From the backend folder
npm run dev

# You should see:
# [Backend] Server running on port 3001
# [Backend] Connected to MongoDB
# [Backend] Firebase initialized
```

### 5. Frontend Setup (in another terminal)

```bash
# From the root folder
npm install

# Start the frontend
npm run dev

# The app will be available at http://localhost:5173
```

### 6. Access Admin Dashboard

1. Navigate to http://localhost:5173/admin
2. Login with admin credentials (if you have set up admin auth)
3. You should now see the dashboard with:
   - **Total Items**: Count of all items in the database
   - **Pending Review**: Items waiting for verification (should show 3 from seed data)
   - **Verified Items**: Approved items (should show 2 from seed data)
   - **Recovered**: Claimed items (should show 1 from seed data)
   - **Pending Verification** section: Shows items needing approval
   - **Recent Activity** section: Shows latest items added
   - **Quick Actions**: Links to manage inventory, add items, and view claims

## API Endpoints

### Admin Dashboard Endpoint
```
GET http://localhost:3001/api/items/admin/dashboard
```
Returns dashboard statistics and recent data.

### Get All Items
```
GET http://localhost:3001/api/items
```

### Create Item
```
POST http://localhost:3001/api/items
Body: {
  title: "Item Name",
  description: "Description",
  category: "Category",
  location: "Location",
  dateLost: "2024-03-20T00:00:00Z",
  itemType: "Lost" | "Found" | "Recovered",
  images: []
}
```

### Verify/Update Item
```
PATCH http://localhost:3001/api/items/:id
Body: {
  verificationStatus: "verified" | "rejected" | "pending",
  status: "active" | "recovered" | "claimed"
}
```

## Troubleshooting

### Dashboard Shows "Failed to load dashboard data"

1. **Check Backend is Running**
   - Terminal should show: `[Backend] Server running on port 3001`
   - If not, run `npm run dev` in the backend folder

2. **Check MongoDB Connection**
   - Look for: `[Database] MongoDB connected successfully`
   - If connection fails:
     - Verify MongoDB is running (`mongod --version`)
     - Check `.env.local` has correct MONGODB_URI
     - For local: `mongodb://localhost:27017/campus-lost-found`
     - For Atlas: `mongodb+srv://user:password@cluster.mongodb.net/dbname`

3. **Check CORS and Ports**
   - Backend must be on port 3001
   - Frontend must be on port 5173
   - Check `backend/.env.local` has: `FRONTEND_URL=http://localhost:5173`

4. **View Debug Logs**
   - Check browser console (F12)
   - Check backend terminal for error messages
   - Look for `[v0]` prefixed messages in console

### Items Not Showing in Dashboard

1. Run the seed script again: `npm run seed`
2. Check MongoDB directly:
   ```bash
   mongosh  # Opens MongoDB shell
   > use campus-lost-found
   > db.items.find().pretty()
   ```

### MongoDB Connection String Issues

**Local:** 
```
mongodb://localhost:27017/campus-lost-found
```

**Atlas (Cloud):**
```
mongodb+srv://username:password@cluster0.mongodb.net/campus-lost-found?retryWrites=true&w=majority
```

**Special Characters in Password:**
- `@` = `%40`
- `#` = `%23`
- `:` = `%3A`

Example: If password is `pass@123#`, use `pass%40123%23`

## Environment Variables

### Backend (.env.local)

| Variable | Value | Description |
|----------|-------|-------------|
| MONGODB_URI | `mongodb://localhost:27017/campus-lost-found` | Database connection string |
| PORT | 3001 | Backend server port |
| NODE_ENV | development | Environment mode |
| FRONTEND_URL | http://localhost:5173 | Frontend URL for CORS |
| JWT_SECRET | your_secret | For JWT authentication |

## Database Schema

### Items Collection

```javascript
{
  _id: ObjectId,
  itemType: "Lost" | "Found" | "Recovered",
  title: String,
  description: String,
  category: String,
  location: String,
  dateLost: Date,
  uploadedAt: Date,
  images: [String],
  userId: String,
  email: String,
  name: String,
  status: "active" | "recovered" | "claimed",
  verificationStatus: "pending" | "verified" | "rejected",
  claimedBy: String,
  claimedAt: Date,
  recoveredBy: {
    email: String,
    name: String,
    date: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Development Workflow

1. **Start backend first:**
   ```bash
   cd backend
   npm run dev
   ```

2. **In another terminal, start frontend:**
   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Main: http://localhost:5173
   - Admin: http://localhost:5173/admin
   - Health check: http://localhost:3001/health

4. **Make changes:**
   - Frontend changes auto-reload (HMR)
   - Backend changes require restart (Ctrl+C, then `npm run dev`)

## Next Steps

1. ✅ Set up MongoDB
2. ✅ Start backend server
3. ✅ Seed database with sample data
4. ✅ Start frontend
5. View admin dashboard
6. Create admin authentication system (TODO)
7. Add email notifications (TODO)
8. Set up image uploads to cloud storage (TODO)

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Check browser console for error messages
3. Check backend terminal logs
4. Verify all services are running (MongoDB, Backend, Frontend)
5. Try clearing browser cache and reloading
