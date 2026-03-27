## Quick Start - Admin Dashboard with Real Database

Get the admin dashboard showing real data from MongoDB in 5 minutes!

### Prerequisites
- Node.js installed  
- MongoDB running locally OR MongoDB Atlas connection string

### Step 1: Ensure MongoDB is Running

**With Docker (easiest):**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Or locally:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
mongod
```

Verify it's running:
```bash
mongosh
> show dbs
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
[Database] MongoDB connected successfully
[Backend] Server running on port 3001
[Backend] Firebase initialized
```

### Step 4: Seed Database with Sample Data (in new terminal)

```bash
cd backend
npm run seed
```

You should see:
```
[Seed] Successfully inserted 6 items
[Seed] Database seeding completed successfully!
```

This adds:
- 3 Lost items (2 pending verification, 1 verified)
- 2 Found items (both verified)
- 1 Recovered item

### Step 5: Start Frontend (in another terminal)

```bash
npm run dev
```

You should see:
```
VITE v6.0.3  ready in 123 ms
➜  Local:   http://localhost:5173/
```

### Step 6: Access Admin Dashboard

1. Open http://localhost:5173/admin
2. You should see the dashboard with real data:
   - **Total Items**: 6
   - **Pending Review**: 3
   - **Verified Items**: 2
   - **Recovered**: 1
3. Click on items to verify/reject them
4. Try the Quick Actions buttons

## ✅ Testing Checklist

- [ ] Backend shows "Server running on port 3001"
- [ ] Backend shows "MongoDB connected successfully"
- [ ] Seed script shows "6 items inserted"
- [ ] Frontend accessible at http://localhost:5173
- [ ] Admin dashboard loads at /admin
- [ ] Dashboard shows stats (Total Items: 6, etc)
- [ ] Pending Verification section shows items
- [ ] Recent Activity section shows items
- [ ] Can click verify/reject buttons

## Troubleshooting

### "Failed to load dashboard data" error

1. **Check backend is running:**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok",...}
   ```

2. **Check MongoDB is connected:**
   - Look for `[Database] MongoDB connected successfully` in backend terminal
   - Or run: `mongosh` and check it connects

3. **Check .env.local exists:**
   ```bash
   cat backend/.env.local
   # Should show MONGODB_URI
   ```

4. **Restart everything:**
   - Stop backend (Ctrl+C)
   - Run `npm run dev` again in backend folder

### No items in dashboard after seeding

```bash
# Check data in MongoDB directly
mongosh campus-lost-found
> db.items.find().pretty()
```

If empty, re-run seed:
```bash
cd backend
npm run seed
```

### MongoDB connection fails

**Error: "ENOTFOUND"**
- Start MongoDB: `docker run -d -p 27017:27017 mongo` or check it's running locally

**Error: "authentication failed"**
- For local MongoDB, no auth needed, just connect to: `mongodb://localhost:27017/campus-lost-found`
- For MongoDB Atlas, get connection string from https://www.mongodb.com/cloud/atlas

**Connection string issues:**
- Local: `mongodb://localhost:27017/campus-lost-found`
- Atlas: `mongodb+srv://user:password@cluster.mongodb.net/campus-lost-found`
- Make sure special chars are URL-encoded: `@` = `%40`, `#` = `%23`

## File Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── index.ts (server entry)
│   │   ├── routes/items.ts (API endpoints)
│   │   ├── models/Item.ts (database schema)
│   │   ├── scripts/seedDatabase.ts (sample data)
│   │   └── config/database.ts (MongoDB connection)
│   ├── .env.local (MongoDB config - auto created)
│   └── package.json (npm run seed)
├── src/pages/Admin/
│   └── AdminDashboard.jsx (dashboard UI)
├── SETUP_GUIDE.md (detailed setup)
└── QUICK_START.md (this file)
```

## API Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `http://localhost:3001/api/items/admin/dashboard` | Get dashboard stats & items |
| GET | `http://localhost:3001/api/items` | List all items |
| PATCH | `http://localhost:3001/api/items/:id` | Verify/reject item |
| POST | `http://localhost:3001/api/items` | Create new item |

## Database Schema

**Items Collection** has these fields:
- `title` - Item name
- `description` - Details
- `category` - Electronics, Bags, etc
- `location` - Where found/lost
- `itemType` - Lost, Found, or Recovered
- `status` - active, recovered, claimed
- `verificationStatus` - pending, verified, rejected
- `email` - User who reported it
- `createdAt` - When reported

## Key Commands

```bash
# Backend
cd backend
npm run dev           # Start development server
npm run seed          # Add sample data
npm run build         # Build for production

# Frontend
npm run dev           # Start development server
npm run build         # Build for production

# Database
mongosh               # Open MongoDB shell
> use campus-lost-found
> db.items.count()    # Count items
> db.items.find()     # Show all items
```

## Next Steps

1. ✅ Dashboard is running with real data
2. Try verifying/rejecting items
3. Click "Manage Inventory" to see all items
4. Add more items by clicking "Report New Item"
5. Read SETUP_GUIDE.md for production deployment

## Support

**Still having issues?**
- Check browser console (F12)
- Check backend terminal for errors
- Read SETUP_GUIDE.md for detailed troubleshooting
- Verify all three are running: MongoDB, Backend (port 3001), Frontend (port 5173)

---

**Status:** ✅ Admin Dashboard Complete
- ✅ MongoDB database connection working
- ✅ Sample data seeded (6 items)
- ✅ Dashboard fetches real data from API
- ✅ Item verification/rejection working
- ✅ Ready for development!
