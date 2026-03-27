# Getting Started with Admin Dashboard

## 🚀 Start in 3 Steps (5 minutes)

### Step 1️⃣: MongoDB (1 minute)
```bash
# Choose one:

# Option A: Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option B: Already installed locally
mongosh
# Should see MongoDB connection
```

✅ When done: `mongosh` should connect successfully

---

### Step 2️⃣: Backend (2 minutes)
```bash
# In one terminal:
cd backend
npm install
npm run dev
```

✅ When done: You should see:
```
[Database] MongoDB connected successfully
[Backend] Server running on port 3001
```

---

### Step 3️⃣: Seed & Frontend (2 minutes)

**Terminal 2** - Add sample data:
```bash
cd backend
npm run seed
```

✅ When done: You should see:
```
[Seed] Successfully inserted 6 items
```

**Terminal 3** - Start frontend:
```bash
npm run dev
```

✅ When done: You should see:
```
VITE ready in X ms
➜ Local: http://localhost:5173/
```

---

## 🎯 View Your Dashboard

Open: **http://localhost:5173/admin**

You should see:
- ✅ **Total Items**: 6
- ✅ **Pending Review**: 3
- ✅ **Verified Items**: 2
- ✅ **Recovered**: 1

### Try It:
1. Click **Verify** button on a pending item
2. Item should disappear from "Pending Verification"
3. **Verified Items** count should increase
4. Refresh page - changes should persist!

---

## 📊 Architecture at a Glance

```
┌─────────────────────────────────────────────────┐
│            Browser (http://localhost:5173)      │
│         ┌────────────────────────────────┐      │
│         │   Admin Dashboard              │      │
│         │  (Shows Real Data!)            │      │
│         │  Stats | Pending | Activity    │      │
│         └────────────┬───────────────────┘      │
└────────────────────────┼──────────────────────────┘
                         │ Axios HTTP
                         │ GET /api/items/admin/dashboard
                         │ PATCH /api/items/:id
                         │
┌────────────────────────▼──────────────────────────┐
│   Node.js/Express Server (:3001)                 │
│  ┌──────────────────────────────────────────┐   │
│  │  Routes: /api/items, /api/items/:id     │   │
│  │  Services: ItemService                  │   │
│  │  Middleware: Auth, Error Handling       │   │
│  └──────────────────┬───────────────────────┘   │
└─────────────────────┼─────────────────────────────┘
                      │ Mongoose ODM
                      │ Query & Update
                      │
┌─────────────────────▼──────────────────────────────┐
│   MongoDB Database (:27017)                       │
│  ┌──────────────────────────────────────────┐    │
│  │  Items Collection                        │    │
│  │  - 6 sample items (seeded)              │    │
│  │  - Real data storage                     │    │
│  │  - Indexes for fast queries             │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

```
User clicks "Verify" button
        ↓
Frontend calls: PATCH /api/items/:id
        ↓
Backend updates: { verificationStatus: "verified" }
        ↓
MongoDB saves changes
        ↓
Response returns updated item
        ↓
Frontend refreshes dashboard
        ↓
Updated stats display
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/.env.local` | MongoDB configuration |
| `backend/src/routes/items.ts` | API endpoints |
| `backend/src/models/Item.ts` | Database schema |
| `backend/src/scripts/seedDatabase.ts` | Sample data |
| `src/pages/Admin/AdminDashboard.jsx` | Dashboard UI |

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to load data" | Check: MongoDB running + Backend running |
| 0 items everywhere | Run: `npm run seed` in backend folder |
| Port in use | Kill process: `lsof -i :3001` (macOS/Linux) |
| Can't connect to MongoDB | Start: `docker run -d -p 27017:27017 mongo` |
| Changes don't persist | Restart backend: Ctrl+C, then `npm run dev` |

See **TROUBLESHOOTING.md** for detailed help.

---

## 📚 Documentation

| Document | Use When |
|----------|----------|
| **QUICK_START.md** | Need fast setup |
| **SETUP_GUIDE.md** | Want detailed options |
| **ADMIN_DASHBOARD_README.md** | Need full overview |
| **IMPLEMENTATION_SUMMARY.md** | Want technical details |
| **TROUBLESHOOTING.md** | Something isn't working |
| **COMPLETION_SUMMARY.txt** | Want implementation recap |

---

## ✨ What's Included

### Database ✅
- MongoDB with Mongoose
- Items collection ready
- 6 sample items for testing
- Seed script to reload data

### API ✅
- 4 REST endpoints
- Dashboard statistics
- Item CRUD operations
- Error handling

### Frontend ✅
- Real-time dashboard
- Item verification workflow
- Error notifications
- Debug logging

### Documentation ✅
- 6 comprehensive guides
- Setup instructions
- Troubleshooting tips
- Code examples

---

## 🎓 Learning Path

### Beginner: Just Want It Working?
1. Follow **QUICK_START.md** (5 min)
2. View dashboard
3. Click verify button
4. Done! ✅

### Intermediate: Want to Understand It?
1. Read **ADMIN_DASHBOARD_README.md**
2. Check **IMPLEMENTATION_SUMMARY.md**
3. Explore `backend/src/routes/items.ts`
4. Look at `src/pages/Admin/AdminDashboard.jsx`

### Advanced: Want to Extend It?
1. Study **SETUP_GUIDE.md** for configuration
2. Review database schema in `backend/src/models/Item.ts`
3. Add new endpoints to `backend/src/routes/items.ts`
4. Update frontend to call new endpoints

---

## 🔧 Configuration

### MongoDB
**Default**: `mongodb://localhost:27017/campus-lost-found`

**Using Atlas (Cloud)**:
1. Create account: https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Update `backend/.env.local` with connection string
4. IP whitelist in Atlas if needed

### Server Port
**Backend**: 3001 (configurable in `.env.local`)
**Frontend**: 5173 (built-in Vite default)
**MongoDB**: 27017 (standard)

---

## 🎯 What to Try

After setup is working:

1. **View Dashboard**
   - See all stats
   - Check pending items list
   - Browse recent activity

2. **Verify an Item**
   - Click green checkmark on pending item
   - Refresh page
   - See it moved to verified count

3. **Reject an Item**
   - Click red X on pending item
   - Item status changes to rejected
   - Data persists in MongoDB

4. **Check Database**
   - Open terminal: `mongosh campus-lost-found`
   - Run: `db.items.find().pretty()`
   - See all items with details

5. **Create New Item**
   - Click "Report New Item"
   - Add item details
   - See it appear in dashboard

---

## 🚀 Command Reference

```bash
# MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest  # Start
mongosh                                                     # Connect

# Backend
cd backend && npm install                                   # Setup
npm run dev                                                 # Start server
npm run seed                                               # Add test data
npm run build                                              # Build

# Frontend
npm run dev                                                # Start dev server
npm run build                                              # Build for production

# Database Management
mongosh campus-lost-found                                  # Open DB shell
> db.items.count()                                         # Count items
> db.items.find().pretty()                                # Show items
> db.items.deleteMany({})                                 # Clear items
```

---

## ✅ Success Checklist

Check these to verify everything is working:

- [ ] MongoDB connects (mongosh works)
- [ ] Backend runs on port 3001
- [ ] Frontend runs on port 5173
- [ ] Dashboard loads at /admin
- [ ] Stats show: Total: 6, Pending: 3, Verified: 2, Recovered: 1
- [ ] Can click verify button
- [ ] Button click updates database
- [ ] Changes persist on refresh
- [ ] No errors in browser console
- [ ] No errors in backend terminal

All checked? **You're all set! 🎉**

---

## 🆘 Need Help?

1. **Check logs**
   - Backend terminal for errors
   - Browser console (F12)
   - Look for `[v0]` messages

2. **Read docs**
   - TROUBLESHOOTING.md for problems
   - SETUP_GUIDE.md for configuration
   - Code comments for details

3. **Verify basics**
   - MongoDB running
   - Backend running
   - Frontend running
   - Correct ports (3001, 5173, 27017)

4. **Check directly**
   ```bash
   # Test API
   curl http://localhost:3001/health
   curl http://localhost:3001/api/items/admin/dashboard
   
   # Check Database
   mongosh campus-lost-found
   > db.items.count()
   ```

---

## 🎊 You're Ready!

Your admin dashboard is fully functional with real MongoDB data. You can:

✅ See live statistics
✅ Verify/reject items
✅ Track activities
✅ Manage inventory
✅ Extend with new features

**Next**: Start with QUICK_START.md or jump right into the dashboard!

Happy coding! 🚀

---

**Status**: Ready to Use ✅
**Setup Time**: ~5 minutes
**Difficulty**: Easy
**All Features**: Working
