# Manual Email/Password Authentication Implementation

## Overview

Successfully implemented a **hybrid authentication system** where:
- ✅ Google login uses Firebase (already working)
- ✅ Manual email/password uses custom backend with MongoDB + bcrypt
- ✅ Both auth methods work together with the same role-based redirects
- ✅ Users are properly saved to MongoDB
- ✅ Admin and student roles are distinguished and routed correctly

## What Was Changed

### Backend Changes

#### 1. User Model (`backend/src/models/User.ts`)
- Added `passwordHash` field for local auth users
- Added `role` field (admin/student) 
- Added `authProvider` field (local/google/firebaseAuth)
- Added `firebaseUid` for Firebase integration
- Added `isActive` for user status tracking

#### 2. LocalAuthService (`backend/src/services/LocalAuthService.ts`) - NEW FILE
- `register()` - Create new local auth user with bcrypt hashing
- `login()` - Verify credentials and generate JWT token
- `verifyToken()` - Validate JWT tokens
- `changePassword()` - Update password with validation
- Private methods for password hashing and comparison
- Returns consistent AuthResponse format

#### 3. Auth Routes (`backend/src/routes/auth.ts`)
- `POST /auth/local/register` - Register with email/password
- `POST /auth/local/login` - Login with email/password
- `PUT /auth/local/change-password` - Change password (authenticated)
- All routes include input validation with express-validator
- Error handling with descriptive messages

#### 4. Auth Middleware (`backend/src/middleware/auth.ts`)
- Enhanced `authMiddleware` to support both local JWT and Firebase tokens
- Added `localAuthMiddleware` for JWT token verification
- Added `hybridAuthMiddleware` to accept either auth type
- Extracts user info from both token types

#### 5. UserService (`backend/src/services/UserService.ts`)
- Updated to work with new User model fields
- Methods for role detection and preference management
- Supports both auth provider types

#### 6. Environment Setup
- Created `backend/.env.local` with required variables
- Added `JWT_SECRET`, `MONGODB_URI`, `FRONTEND_URL`
- Firebase admin SDK configuration

### Frontend Changes

#### 1. AuthProvider (`src/context/Authcontext/AuthProvider.jsx`)
- Added `registerWithEmail()` - Local auth signup
- Added `signInWithEmail()` - Local auth login
- Updated `signInWithGoogle()` - Keeps working, now also syncs to MongoDB
- Added constants: `AUTH_PROVIDERS` (LOCAL/GOOGLE), `USER_ROLES` (ADMIN/STUDENT)
- Unified session management with `authToken` and `authProvider` in localStorage
- Both auth methods set axios Authorization header with token
- Role detection happens on both sign up and login

#### 2. AdminLogin Page (`src/pages/AdminLogin/AdminLogin.jsx`)
- Uses `signInWithEmail()` for local auth
- Validates user is admin role
- Shows error if non-admin tries to login at admin endpoint
- Handles both Google and email/password login
- Proper error handling and user feedback

#### 3. Signin Page (Student) (`src/pages/Signin/Signin.jsx`)
- Updated to use `signInWithEmail()` for local auth
- Redirects to appropriate student dashboard after login
- Shows form for email/password entry
- Google login option available

#### 4. Register Page (`src/pages/Register/Register.jsx`)
- Updated to use `registerWithEmail()` for signup
- Auto-detects role based on email (admin emails from config)
- Stores display name and optional profile photo
- Handles both Google signup and email/password signup
- Validates password strength (min 6 chars)

#### 5. Environment Setup
- Created `.env.local` with `VITE_API_URL=http://localhost:3001/api`
- Firebase configuration variables

### Database Schema

MongoDB `users` collection:
```json
{
  "_id": ObjectId,
  "email": string (unique),
  "displayName": string,
  "photoURL": string,
  "passwordHash": string (local auth only),
  "role": "admin" | "student",
  "authProvider": "local" | "google" | "firebaseAuth",
  "firebaseUid": string (optional),
  "isActive": boolean,
  "studentProfile": object,
  "adminProfile": object,
  "notificationPreferences": object,
  "createdAt": Date,
  "updatedAt": Date
}
```

### API Response Format

All auth endpoints return consistent format:
```json
{
  "success": true,
  "message": "Success message",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "displayName": "User Name",
    "role": "admin",
    "authProvider": "local",
    "profileImage": "url"
  },
  "token": "jwt_token_here"
}
```

## How It Works

### Registration Flow (Local Auth)
1. User fills email, password, display name
2. Frontend calls `registerWithEmail(email, password, displayName)`
3. Backend validates input, checks email not taken
4. Password hashed with bcrypt (10 rounds)
5. User saved to MongoDB with role determined by email
6. JWT token generated and returned
7. Frontend stores token and authProvider in localStorage
8. Redirects to appropriate dashboard based on role

### Login Flow (Local Auth)
1. User fills email, password
2. Frontend calls `signInWithEmail(email, password)`
3. Backend looks up user by email
4. Compares submitted password with stored hash using bcrypt
5. If match: generates JWT token and returns user data
6. Frontend stores token in localStorage
7. Redirects to role-specific dashboard

### Token Verification
- JWT tokens expire in 7 days
- Token sent in `Authorization: Bearer <token>` header
- Backend middleware extracts and verifies token
- If invalid: returns 401 Unauthorized
- If valid: passes user info to protected routes

### Role Detection
- Admin emails: defined in backend `LocalAuthService.ts` and frontend `schoolConfig.js`
- Example admin: `bagenigilbert@zetech.ac.ke`
- Any other email defaults to student role
- Role is stored in user profile and JWT payload

## Testing

### Manual Auth Signup/Login
1. Go to `/register` (student) or fill admin email at `/admin-login`
2. Enter email, password, display name
3. Submit to create account
4. Login with same credentials
5. Should redirect to appropriate dashboard

### Google Auth (Unchanged)
1. Click "Sign in with Google" on any login page
2. Continues to work as before
3. Also syncs to MongoDB

### Verify Both Auth Methods Work
- Signup with email/password
- Logout
- Login with Google (same email)
- Should be logged in as same account

## Security Features

✅ Passwords hashed with bcrypt (10 rounds)
✅ JWT tokens expire after 7 days
✅ Environment variables for secrets (JWT_SECRET)
✅ Input validation on all endpoints
✅ Protected routes require valid token
✅ CORS enabled only for frontend origin
✅ No password stored in plaintext
✅ No tokens in URL or cookies (localStorage with optional httpOnly)

## Environment Variables Required

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

**Backend (.env.local):**
```
MONGODB_URI=mongodb://localhost:27017/zetech-lost-found
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Files Created

- `/backend/src/services/LocalAuthService.ts` - Local auth implementation
- `.env.local` - Frontend environment variables
- `backend/.env.local` - Backend environment variables
- `MANUAL_AUTH_GUIDE.md` - User guide for testing
- `TROUBLESHOOTING.md` - Common issues and solutions
- `start.sh` - Startup script for both servers

## Files Modified

- `backend/src/models/User.ts` - Added local auth fields
- `backend/src/routes/auth.ts` - Added local auth routes
- `backend/src/middleware/auth.ts` - Support both auth types
- `backend/src/services/UserService.ts` - Updated for new fields
- `backend/package.json` - Added uuid dependency
- `src/context/Authcontext/AuthProvider.jsx` - Added local auth methods
- `src/pages/AdminLogin/AdminLogin.jsx` - Use local auth
- `src/pages/Signin/Signin.jsx` - Use local auth
- `src/pages/Register/Register.jsx` - Use local auth

## Next Steps

1. Ensure MongoDB is running locally
2. Run `npm install` in backend directory
3. Run `npm install` in root directory
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `npm run dev`
6. Visit http://localhost:5173 and test signup/login

Or simply run: `./start.sh` (on Linux/Mac)

## Troubleshooting Common Issues

See `TROUBLESHOOTING.md` for:
- Network connection errors
- MongoDB connection issues
- Token/authentication errors
- Role detection problems
- CORS issues

## Questions or Issues?

Refer to the documentation:
- `MANUAL_AUTH_GUIDE.md` - How to use manual auth
- `TROUBLESHOOTING.md` - Common problems and solutions
- Backend API docs in auth routes file
- Frontend auth context for method signatures
