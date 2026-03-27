# Troubleshooting Guide - Admin Dashboard

## Common Issues and Solutions

### Issue 1: Dashboard Shows "Failed to load dashboard data"

#### Symptoms
- Red error banner at top of admin dashboard
- All stats show 0
- No pending items or recent activity

#### Possible Causes & Solutions

**A) Backend server not running**
```bash
# Check if backend is running
curl http://localhost:3001/health

# If not running, start it:
cd backend
npm run dev

# You should see:
# [Backend] Server running on port 3001
# [Database] MongoDB connected successfully
```

**B) MongoDB not running**
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
# Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or locally:
brew services start mongodb-community   # macOS
sudo systemctl start mongod             # Linux
mongod                                   # Windows
```

**C) Wrong MONGODB_URI in .env.local**
```bash
# Check .env.local exists in backend folder
cat backend/.env.local

# Should have:
# MONGODB_URI=mongodb://localhost:27017/campus-lost-found

# If missing, create it with the content from SETUP_GUIDE.md
```

**D) CORS issue**
- Check backend `.env.local` has: `FRONTEND_URL=http://localhost:5173`
- Restart backend server
- Clear browser cache (Ctrl+Shift+Delete)

#### Resolution Checklist
- [ ] MongoDB is running (`mongosh` connects)
- [ ] Backend is running on port 3001
- [ ] `.env.local` exists in backend folder
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows request to `/api/items/admin/dashboard`

---

### Issue 2: No Items in Dashboard (0 items everywhere)

#### Symptoms
- Dashboard loads but all stats are 0
- "No items pending verification"
- "No activity yet"

#### Possible Causes & Solutions

**A) Database was not seeded**
```bash
# Seed the database:
cd backend
npm run seed

# You should see:
# [Seed] Successfully inserted 6 items
# [Seed] Database seeding completed successfully!

# Then refresh the dashboard
```

**B) Items are in wrong database**
```bash
# Check which databases exist:
mongosh
> show dbs

# Should see: campus-lost-found

# If not, check MONGODB_URI in backend/.env.local
# Default should be: mongodb://localhost:27017/campus-lost-found
```

**C) Connection string is wrong**
```bash
# Verify MongoDB connection:
mongosh "mongodb://localhost:27017/campus-lost-found"

# If it connects, run seed:
cd backend
npm run seed
```

#### Resolution Checklist
- [ ] Run `npm run seed` from backend folder
- [ ] Seed script shows "6 items inserted"
- [ ] Refresh admin dashboard
- [ ] Stats should now show: Total Items: 6, Pending: 3, etc

---

### Issue 3: Backend Won't Start - "ENOTFOUND" or "ECONNREFUSED"

#### Symptoms
```
[Database] MongoDB connection error: ENOTFOUND
[Backend] Failed to start server
```

#### Causes & Solutions

**A) MongoDB not running**
```bash
# Test MongoDB connection:
mongosh

# If fails, start MongoDB:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**B) Wrong MongoDB URI**
```bash
# Check your URI in backend/.env.local
cat backend/.env.local | grep MONGODB_URI

# Should be ONE of these:
# Local:   mongodb://localhost:27017/campus-lost-found
# Atlas:   mongodb+srv://user:pass@cluster.mongodb.net/campus-lost-found
```

**C) Typo in connection string**
- Double-check no spaces or special characters
- If using Atlas, ensure special characters are URL-encoded:
  - `@` = `%40`
  - `#` = `%23`
  - `:` = `%3A`

**D) MongoDB Atlas IP not whitelisted**
```
If using MongoDB Atlas:
1. Go to https://cloud.mongodb.com/
2. Click "Network Access"
3. Click "Add IP Address"
4. Add 0.0.0.0/0 (allows all IPs, for development only)
5. Confirm and retry
```

#### Resolution Checklist
- [ ] MongoDB is running
- [ ] MONGODB_URI in .env.local is correct
- [ ] Special characters are URL-encoded (if using Atlas)
- [ ] IP is whitelisted in MongoDB Atlas
- [ ] Restart backend: `npm run dev`

---

### Issue 4: Port Already in Use

#### Symptoms
```
Port 3001 is already in use
listen EADDRINUSE: address already in use :::3001
```

#### Solutions

**Option A) Kill the process using port 3001**
```bash
# macOS/Linux:
lsof -i :3001
kill -9 <PID>

# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Option B) Use a different port**
```bash
# Edit backend/.env.local
PORT=3002

# Then in frontend, update API calls to port 3002
```

**Option C) Restart everything**
```bash
# Kill all node processes
pkill -f node

# Restart backend
cd backend && npm run dev
```

---

### Issue 5: "Cannot POST /api/items" or 404 errors

#### Symptoms
- Network error when trying to create/update items
- 404 error in network tab
- Route not found error

#### Solutions

1. **Check API endpoint format**
   - Correct: `http://localhost:3001/api/items`
   - Check no trailing slashes or typos

2. **Check request headers**
   ```bash
   # Should have:
   Content-Type: application/json
   ```

3. **Verify backend has the route**
   ```bash
   # Check backend/src/routes/items.ts exists
   # Should have POST, PATCH, DELETE routes
   ```

4. **Check request body**
   - Should be valid JSON
   - Should include required fields

---

### Issue 6: Verify/Reject Button Doesn't Work

#### Symptoms
- Click verify/reject button, nothing happens
- No console errors
- No network request visible

#### Solutions

**A) Check network tab**
- Open DevTools (F12)
- Click Network tab
- Click verify button
- Look for request to `/api/items/:id`
- If no request appears, button click isn't triggering

**B) Check browser console**
- F12 → Console tab
- Look for error messages
- Look for `[v0]` debug logs
- Should show item being verified

**C) Check item ID**
```javascript
// In browser console:
// Log the item object to verify it has _id
console.log(item)  // Should have _id property
```

**D) Verify endpoint exists**
```bash
# In backend, check PATCH route exists:
grep -n "router.patch" backend/src/routes/items.ts
# Should see: router.patch('/:id', ...)
```

#### Resolution Steps
1. Check browser console for error messages
2. Check network tab for failed requests
3. Restart backend server
4. Refresh admin dashboard
5. Try verify button again

---

### Issue 7: Database Shows Items But Dashboard Doesn't

#### Symptoms
```bash
# mongosh shows items:
> db.items.find().count()
6

# But dashboard shows 0 items
```

#### Possible Causes

**A) Wrong database**
```bash
# Check current database:
mongosh
> db.getName()
# Should show: campus-lost-found

# Check connection in backend .env.local
# Should have: MONGODB_URI=mongodb://localhost:27017/campus-lost-found
```

**B) Items collection exists but endpoint not working**
```bash
# Test endpoint directly:
curl http://localhost:3001/api/items/admin/dashboard

# Should return JSON with items
# If not, check backend logs for errors
```

**C) Old backend instance running**
```bash
# Kill all node processes
pkill -f node

# Restart backend
cd backend && npm run dev
```

---

### Issue 8: "Cannot find module" or import errors

#### Symptoms
```
Error: Cannot find module 'mongoose'
Error: Cannot find module '@/models/Item'
```

#### Solutions

**A) Dependencies not installed**
```bash
cd backend
npm install
npm run dev
```

**B) Clean reinstall**
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

**C) TypeScript compilation error**
```bash
cd backend
npm run build
# Check for TypeScript errors
```

---

### Issue 9: "MONGODB_URI not set" error

#### Symptoms
```
[Database] MONGODB_URI is not set!
[Database] Add to .env.local: MONGODB_URI=mongodb://...
```

#### Solutions

**A) Create .env.local file**
```bash
# In backend folder, create .env.local with:
MONGODB_URI=mongodb://localhost:27017/campus-lost-found
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

**B) Verify file location**
```bash
# File should be at:
backend/.env.local

# Check it exists:
ls backend/.env.local
cat backend/.env.local
```

**C) Restart backend**
```bash
cd backend
npm run dev
# Should now see: [Database] MongoDB connected successfully
```

---

### Issue 10: Frontend Shows Blank Dashboard

#### Symptoms
- Page loads but no stats cards visible
- No content under "Pending Verification"
- "Loading" state continues forever

#### Solutions

**A) Check network request**
- F12 → Network tab
- Filter for "dashboard"
- Look for `/api/items/admin/dashboard` request
- Check response status and body

**B) Check for JavaScript errors**
- F12 → Console tab
- Look for red error messages
- Look for `[v0]` debug messages

**C) Clear cache and reload**
```bash
# Hard refresh:
Ctrl+F5  (Windows/Linux)
Cmd+Shift+R  (macOS)

# Or clear cache:
F12 → Application → Clear Site Data
```

**D) Check component is mounted**
```javascript
// In browser console:
window.location.pathname  // Should show: /admin
// If not on /admin page, navigate to it
```

---

## Debug Checklist

Use this checklist when something isn't working:

1. **Environment**
   - [ ] MongoDB running (`mongosh` works)
   - [ ] Backend running on port 3001 (`curl http://localhost:3001/health`)
   - [ ] Frontend running on port 5173
   - [ ] `.env.local` exists in backend folder

2. **Network**
   - [ ] No CORS errors in console
   - [ ] Network request to `/admin/dashboard` visible
   - [ ] Response status is 200, not 404 or 500
   - [ ] Response body contains `data` object

3. **Database**
   - [ ] MongoDB connection successful
   - [ ] Database `campus-lost-found` exists
   - [ ] Items collection exists and has data
   - [ ] No duplicate MongoDB instances running

4. **Application**
   - [ ] Admin dashboard page accessible
   - [ ] Stats cards render (even if showing 0)
   - [ ] No JavaScript errors in console
   - [ ] Verify/reject buttons clickable

## Useful Commands

```bash
# Check MongoDB
mongosh campus-lost-found
> db.items.count()
> db.items.find().pretty()

# Check Backend
curl http://localhost:3001/health
curl http://localhost:3001/api/items

# Check Ports
lsof -i :3001      # macOS/Linux
netstat -ano       # Windows

# View Backend Logs
cd backend && npm run dev  # Shows all logs

# Clear Everything
pkill -f node
rm -rf backend/node_modules frontend/node_modules
npm install && cd backend && npm install
```

## Getting Help

If you're still stuck:

1. **Check the logs:**
   - Backend terminal (shows database/server errors)
   - Browser console F12 (shows frontend errors)
   - Look for error messages with line numbers

2. **Read the relevant guide:**
   - `QUICK_START.md` - 5-minute setup
   - `SETUP_GUIDE.md` - Detailed setup
   - `IMPLEMENTATION_SUMMARY.md` - How it works

3. **Verify the basics:**
   - MongoDB is running
   - Backend is running and can connect to MongoDB
   - Frontend is running on port 5173
   - Can access http://localhost:5173/admin

4. **Check API directly:**
   ```bash
   curl http://localhost:3001/api/items/admin/dashboard
   # Should return JSON with data
   ```

If still stuck, share:
- The error message
- The backend logs (screenshot or copy-paste)
- The browser console errors
- Your `backend/.env.local` file (redact passwords)

---

**Last Updated**: March 27, 2026
**Status**: ✅ Complete

Most common issues are:
1. MongoDB not running
2. Backend not started
3. Database not seeded
4. Wrong port numbers
5. Old node process still running

Try these in order: MongoDB → Backend → Seed → Frontend → Dashboard ✅
