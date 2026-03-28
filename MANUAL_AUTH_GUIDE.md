## Manual Email/Password Authentication Setup

### What Was Fixed

The manual email/password authentication is now fully implemented alongside Google Firebase auth. Previously, attempting to use `signInWithEmailAndPassword` from Firebase would fail because that auth method wasn't enabled in Firebase.

**New Implementation:**
- Manual signup/login now uses your own backend with MongoDB + bcrypt password hashing
- Google login continues to use Firebase (unchanged)
- Both auth methods share the same role-based redirects and protected routes
- Users are stored in MongoDB with secure password hashing

### Testing the Manual Auth

#### For Admin Manual Login:
1. Go to http://localhost:5173/admin-login
2. Use email: `bagenigilbert@zetech.ac.ke` (admin email)
3. First time? Click "Create Account" in the form (auto-redirects to signup)
4. Complete the signup with a password (min 6 chars)
5. After signup, login with email/password
6. Should redirect to `/admin` dashboard

#### For Student Manual Login:
1. Go to http://localhost:5173/signin
2. Use any non-admin email
3. Click signup if first time
4. Complete signup with password
5. After signup, login with email/password
6. Should redirect to `/` (student dashboard)

#### For Admin Manual Signup:
1. Go to http://localhost:5173/register
2. Use admin email: `bagenigilbert@zetech.ac.ke`
3. Fill in display name and password
4. Submit to create admin account
5. Should redirect to admin login page

### Backend Endpoints Available

```
POST /api/auth/local/register
- email, password, displayName, photoURL

POST /api/auth/local/login
- email, password

PUT /api/auth/local/change-password
- userId, currentPassword, newPassword (requires auth token)

GET /api/auth/verify-token
- Verify JWT token validity
```

### Environment Variables

Frontend (.env.local):
- `VITE_API_URL` - Backend API base URL (http://localhost:3001/api)
- Firebase config variables

Backend (.env.local):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FIREBASE_*` - Firebase admin SDK credentials

### How It Works

1. User submits email/password → Backend validates and hashes password with bcrypt
2. On successful login → Backend generates JWT token
3. Token stored in localStorage as `authToken` with `authProvider: 'local'`
4. Token sent in Authorization header for subsequent requests
5. Both JWT and Firebase tokens are validated by the backend auth middleware
6. Role determined by email domain (admin emails from schoolConfig)

### Testing Credentials

Once you run the app and signup:
- Email: `bagenigilbert@zetech.ac.ke` (admin)
- Email: `student@zetech.ac.ke` (student)
- Password: anything with 6+ characters

All credentials persist in MongoDB, so after first signup, you can login with same credentials.
