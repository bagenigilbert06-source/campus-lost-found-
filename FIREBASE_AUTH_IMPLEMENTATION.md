# Firebase Authentication Implementation Guide

## Overview
Your application uses **Firebase Authentication** for both email/password and Google sign-in. The backend MongoDB is used for user profile storage and synchronization, while Firebase handles all authentication.

## Authentication Flow

### 1. Email/Password Registration
```
User fills register form
↓
Register.jsx calls createUser(email, password, name, photo)
↓
AuthProvider.jsx:
  - Firebase: createUserWithEmailAndPassword()
  - Firebase: updateProfile() with displayName and photoURL
  - Firebase: getIdToken() → stored in localStorage as 'firebaseToken'
  - Backend: POST /api/auth/register (syncs user to MongoDB)
↓
User logged in automatically
↓
Redirect to home page
```

### 2. Email/Password Login
```
User fills signin form
↓
Signin.jsx calls singInUser(email, password)
↓
AuthProvider.jsx:
  - Firebase: signInWithEmailAndPassword()
  - Firebase: getIdToken() → stored in localStorage as 'firebaseToken'
  - axios automatically adds Bearer token to all requests
↓
User logged in
↓
Redirect to home page
```

### 3. Admin Login
```
User fills admin login form
↓
AdminLogin.jsx calls singInUser(email, password)
↓
Same as regular login, but with admin check:
  - Verifies user email is in adminEmails list
  - If not admin, denies access
  - Redirects to /admin if admin
```

### 4. Google Sign-In
```
User clicks Google button
↓
Signin/Register/AdminLogin calls signInWithGoogle()
↓
AuthProvider.jsx:
  - Firebase: signInWithPopup() with Google provider
  - Firebase: getIdToken() → stored in localStorage as 'firebaseToken'
  - Backend: POST /api/auth/register (syncs Google user to MongoDB)
↓
User logged in
↓
Redirect appropriate to role
```

## File Structure & Implementation

### AuthProvider.jsx (`/src/context/Authcontext/AuthProvider.jsx`)

**Key Functions:**
- `createUser(email, password, displayName, photoURL)` - Firebase registration
- `singInUser(email, password)` - Firebase email/password login
- `signInWithGoogle()` - Firebase Google sign-in
- `signOutUser()` - Logout and clear tokens
- `determineUserRole(email)` - Check if user is admin

**Token Management:**
- Firebase ID tokens stored in localStorage as `firebaseToken`
- Tokens sent to backend via `Authorization: Bearer {token}` header
- axios interceptor automatically adds token to all requests
- Tokens automatically restored on page refresh via `onAuthStateChanged()` listener

**State:**
- `user` - Current Firebase user object
- `loading` - Auth operation in progress
- `userRole` - 'admin' or 'student' based on email
- `isAdmin` - Boolean flag for admin users

### Register.jsx (`/src/pages/Register/Register.jsx`)

**Flow:**
1. User enters: name, email, password, photo URL
2. Validates password (6+ chars, uppercase, lowercase)
3. Calls `createUser()` from context
4. On success: toast notification + redirect to home
5. On error: Shows Firebase error message in user-friendly format

**Error Handling:**
- `auth/email-already-in-use` → "Email already registered"
- `auth/weak-password` → "Password too weak"
- `auth/operation-not-allowed` → "Email/password not enabled"

### Signin.jsx (`/src/pages/Signin/Signin.jsx`)

**Flow:**
1. User enters: email, password
2. Calls `singInUser()` from context
3. On success: toast + redirect to home
4. On error: Shows Firebase error message

**Error Handling:**
- `auth/user-not-found` → "No account with this email"
- `auth/wrong-password` → "Incorrect password"
- `auth/too-many-requests` → "Try again later"

### AdminLogin.jsx (`/src/pages/AdminLogin/AdminLogin.jsx`)

**Flow:**
1. Same as regular login, but:
2. After Firebase login, checks if `isAdmin` is true
3. If not admin: denies access + redirects to /
4. If admin: allows access + redirects to /admin

**Status Indicators:**
- `isLoading` state shows "Signing in..." while processing

## Backend Integration

### Endpoints Used

**POST /api/auth/register** (Firebase-protected)
```
Request:
{
  email: "user@zetech.ac.ke",
  displayName: "John Doe",
  photoURL: "https://..."
}

Response:
{
  success: true,
  user: {
    _id: "mongo_id",
    email: "user@zetech.ac.ke",
    displayName: "John Doe",
    role: "student",
    authProvider: "firebase"
  }
}
```

**GET /api/auth/me** (Firebase or local token)
```
Returns: Current user profile from MongoDB
```

**PUT /api/auth/profile** (Firebase token required)
```
Updates user profile on MongoDB
```

## Token Management

### How Tokens Flow

1. **Login/Registration:**
   - Firebase returns ID token
   - Token stored in `localStorage.firebaseToken`
   - axios interceptor adds `Authorization: Bearer {token}`

2. **Page Refresh:**
   - App loads
   - `onAuthStateChanged()` fires
   - If user logged in: gets fresh token via `getIdToken()`
   - Updates localStorage and axios header
   - User stays logged in

3. **Logout:**
   - `signOutUser()` called
   - Firebase signs out user
   - localStorage token cleared
   - axios header cleared
   - User redirected to login

### Token Refresh

Firebase automatically refreshes tokens when they expire. The `getIdToken()` function always returns a valid token, refreshing if needed.

## Error Handling

### Firebase Error Codes

| Code | Meaning | User Message |
|------|---------|--------------|
| `auth/email-already-in-use` | Email registered | "Email already registered" |
| `auth/invalid-email` | Bad email format | "Invalid email address" |
| `auth/weak-password` | Password too weak | "Password too weak" |
| `auth/user-not-found` | No account | "No account with this email" |
| `auth/wrong-password` | Bad password | "Incorrect password" |
| `auth/user-disabled` | Account disabled | "Account disabled" |
| `auth/too-many-requests` | Rate limited | "Try again later" |
| `auth/popup-blocked` | Popup blocked | "Popup blocked" |
| `auth/popup-closed-by-user` | User closed popup | "Sign-in cancelled" |

All errors are mapped to friendly messages in the respective components.

## Loading States

### Register Component
- Button shows spinner via Tailwind class
- Form disabled during submission
- No explicit loading state (implicit via button action)

### Signin Component
- Button text may change during submission (consider adding)
- Form disabled during submission
- No explicit loading state

### AdminLogin Component
- `isLoading` state tracks submission
- Button disabled and shows "Signing in..." text when loading
- Prevents double submission

## Session Persistence

### On App Load
1. Firebase `onAuthStateChanged()` fires
2. If user logged in:
   - Gets fresh ID token
   - Updates localStorage
   - Sets axios header
   - Determines user role
3. Components re-render with user data
4. Routes render appropriate pages based on role

### On Page Refresh
1. App mounts
2. AuthProvider checks `onAuthStateChanged()`
3. User session restored from Firebase
4. No need to log in again
5. All requests automatically have bearer token

## Security Considerations

### Token Storage
- Firebase tokens stored in localStorage
- Acceptable for SPAs (no sensitive data)
- HTTPS only in production
- CORS configured on backend

### Request Security
- All requests include `Authorization: Bearer {token}`
- Backend verifies token with Firebase before processing
- MongoDB stores user profiles separately
- Admin emails in `schoolConfig.adminEmails`

### MongoDB User Storage
- User profiles cached after login
- Email, name, photo stored
- Role determined from email at login
- Profiles sync on each login

## Troubleshooting

### 401 Unauthorized Errors
**Cause:** Token missing or invalid
**Solution:** 
- Check localStorage has `firebaseToken`
- Verify Firebase configuration
- Ensure user logged in before API call

### Registration Fails
**Cause:** Email already exists or weak password
**Solution:**
- Show Firebase error code message
- Ask user to use different email
- Ensure password meets requirements

### Can't Log In
**Cause:** User not in Firebase or wrong password
**Solution:**
- Verify user exists in Firebase console
- Reset password if forgot
- Check caps lock on password

### Google Sign-In Not Working
**Cause:** Popup blocked or Firebase not configured
**Solution:**
- Allow popups for the site
- Verify Google OAuth credentials in Firebase
- Check Firebase console configuration

## Testing Checklist

- [ ] Register with email/password → redirects to home
- [ ] Login with email/password → redirects to home
- [ ] Admin login with admin email → redirects to /admin
- [ ] Non-admin login attempt → shows access denied
- [ ] Google sign-in works → user logged in
- [ ] Logout → user logged out, redirected to login
- [ ] Page refresh → user stays logged in
- [ ] Duplicate email registration → error shown
- [ ] Wrong password login → error shown
- [ ] Tokens in localStorage after login
- [ ] Authorization header sent with requests
- [ ] Token cleared on logout

## Next Steps

1. **Environment Variables:** Ensure all Firebase env vars are set
2. **Test Flows:** Run through all auth flows
3. **Error Testing:** Try invalid inputs and verify error messages
4. **Production:** Deploy with HTTPS and production Firebase credentials
5. **Monitoring:** Monitor Firebase console for auth events
