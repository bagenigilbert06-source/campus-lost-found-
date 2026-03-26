## Quick Start Guide - Manual Email/Password Authentication

### Prerequisites
- Node.js installed
- MongoDB running locally (or connection string in `.env.local`)
- Frontend and backend both need to be started

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Start MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows (if installed)
mongod

# Or check Docker
docker run -d -p 27017:27017 --name mongo mongo:latest
```

Verify MongoDB is running:
```bash
mongosh
> show dbs
```

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
[Backend] Connected to MongoDB
[Backend] Firebase initialized
[Backend] Server running on port 3001
```

### Step 4: Start Frontend (in new terminal)

```bash
npm run dev
```

You should see:
```
VITE v6.0.3  ready in 123 ms

➜  Local:   http://localhost:5173/
```

### Step 5: Test Manual Auth

#### Student Registration & Login
1. Visit http://localhost:5173/signin
2. Click "Create Account" 
3. Fill in form:
   - Email: `student@zetech.ac.ke`
   - Password: `password123`
   - Display Name: `Test Student`
4. Click Sign Up
5. Should redirect to login page
6. Login with same email/password
7. Should redirect to student dashboard

#### Admin Registration & Login
1. Visit http://localhost:5173/admin-login
2. Click on "Create Account" or go to register
3. Fill in form:
   - Email: `bagenigilbert@zetech.ac.ke` (admin email)
   - Password: `password123`
   - Display Name: `Admin User`
4. Sign up
5. Go to admin login page
6. Login with email/password
7. Should redirect to `/admin` dashboard

### Step 6: Test Google Auth (Optional)

1. Click "Sign in with Google" on any login page
2. Authenticate with your Google account
3. Should sync to MongoDB and login

## Testing Checklist

- [ ] Backend console shows "Server running on port 3001"
- [ ] Frontend shows at localhost:5173
- [ ] Can navigate to /signin and /admin-login
- [ ] Email/password form is visible
- [ ] Can signup with new email/password
- [ ] Signup redirects to login
- [ ] Can login with credentials
- [ ] Login redirects to correct dashboard
- [ ] Logout works and clears auth
- [ ] Browser console shows no CORS errors
- [ ] Google login still works

## Common Issues

### Backend won't connect to MongoDB
```bash
# Check MongoDB is running
mongosh

# If not running, start it:
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Frontend shows "Network Error"
- Check backend is running on port 3001
- Check VITE_API_URL in `.env.local` is `http://localhost:3001/api`
- Check browser network tab for the request

### "Cannot find localAuthService"
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Still seeing Firebase auth errors
- Clear browser cache
- Clear localStorage
- Hard refresh (Ctrl+F5)
- Restart frontend dev server

## File Structure Reference

```
project/
├── src/
│   ├── context/Authcontext/
│   │   ├── AuthProvider.jsx (main auth logic)
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Signin/
│   │   ├── Register/
│   │   └── AdminLogin/
│   └── router/
│       ├── AdminRoute.jsx (admin only)
│       └── StudentRoute.jsx (student only)
├── backend/
│   ├── src/
│   │   ├── services/LocalAuthService.ts (password hashing, JWT)
│   │   ├── routes/auth.ts (API endpoints)
│   │   ├── middleware/auth.ts (token verification)
│   │   └── models/User.ts (MongoDB schema)
│   └── .env.local
├── .env.local
└── MANUAL_AUTH_GUIDE.md
```

## Key Files to Review

1. **Backend Auth Service** - `backend/src/services/LocalAuthService.ts`
   - How passwords are hashed
   - How JWT tokens are generated
   - Role detection logic

2. **Backend Auth Routes** - `backend/src/routes/auth.ts`
   - `/api/auth/local/register` endpoint
   - `/api/auth/local/login` endpoint
   - Input validation

3. **Frontend Auth Provider** - `src/context/Authcontext/AuthProvider.jsx`
   - `registerWithEmail()` method
   - `signInWithEmail()` method
   - Google auth integration

4. **Login Pages** - `src/pages/Signin/Signin.jsx` and `src/pages/AdminLogin/AdminLogin.jsx`
   - How they call auth methods
   - How they handle role-based redirects

## Useful Commands

```bash
# Clean and reinstall dependencies
cd backend && rm -rf node_modules && npm install && cd ..

# Check what's in MongoDB
mongosh zetech-lost-found
> db.users.find()
> db.users.count()

# Check backend health
curl http://localhost:3001/health

# View backend logs
cd backend && npm run dev

# Clear frontend cache
rm -rf node_modules
npm install
npm run dev
```

## Environment Variables Quick Reference

**Frontend** (.env.local):
- `VITE_API_URL` - Backend API address
- Firebase config variables

**Backend** (.env.local):
- `MONGODB_URI` - MongoDB connection
- `JWT_SECRET` - Token signing key
- `PORT` - Server port (default 3001)
- `FRONTEND_URL` - CORS origin

## Next Steps

1. Test manual auth works as described above
2. Read `MANUAL_AUTH_GUIDE.md` for detailed usage
3. Read `TROUBLESHOOTING.md` if issues arise
4. Read `MANUAL_AUTH_IMPLEMENTATION.md` for technical details

---

**Status:** ✅ Implementation Complete
- ✅ Manual email/password auth working
- ✅ Google auth still working
- ✅ Both auth methods use same role-based redirects
- ✅ Users stored in MongoDB
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for session management
