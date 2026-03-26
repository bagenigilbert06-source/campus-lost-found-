# Quick Reference Guide - Firebase Authentication

## 🚀 Quick Start

### Environment Setup
```bash
# .env.local must have:
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project_id
VITE_FIREBASE_STORAGE_BUCKET=bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=sender_id
VITE_FIREBASE_APP_ID=app_id
VITE_API_URL=http://localhost:3001/api
```

### Admin Emails Setup
```javascript
// /src/config/schoolConfig.js
export const schoolConfig = {
    adminEmails: ['admin@zetech.ac.ke', 'admin2@zetech.ac.ke'],
    // ... other config
};
```

---

## 🔐 Authentication Flows

### Register (Email/Password)
```
User Form Input
    ↓
Register.jsx: handleSignUp()
    ↓
useContext(AuthContext).createUser()
    ↓
Firebase: createUserWithEmailAndPassword()
    ↓
Firebase: updateProfile()
    ↓
Firebase: getIdToken() → localStorage.firebaseToken
    ↓
POST /api/auth/register (MongoDB sync)
    ↓
toast.success() + navigate('/')
```

### Login (Email/Password)
```
User Form Input
    ↓
Signin.jsx: handleSignin()
    ↓
useContext(AuthContext).singInUser()
    ↓
Firebase: signInWithEmailAndPassword()
    ↓
Firebase: getIdToken() → localStorage.firebaseToken
    ↓
axios header: Authorization: Bearer {token}
    ↓
toast.success() + navigate('/')
```

### Admin Login
```
Same as Login
    +
isAdmin check (email in adminEmails)
    ↓
If admin: navigate('/admin')
If not: show error + navigate('/')
```

### Google Sign-In
```
User Clicks Google Button
    ↓
Signin/Register/AdminLogin.jsx: handleGoogleSignIn()
    ↓
useContext(AuthContext).signInWithGoogle()
    ↓
Firebase: signInWithPopup() + GoogleAuthProvider
    ↓
Firebase: getIdToken() → localStorage.firebaseToken
    ↓
POST /api/auth/register (MongoDB sync)
    ↓
toast.success() + navigate appropriately
```

---

## 📦 Context API Usage

### AuthProvider Exports
```javascript
const authInfo = {
    user,              // Firebase user object
    loading,           // boolean: auth operation in progress
    userRole,          // 'admin' or 'student'
    isAdmin,           // boolean: true if admin
    createUser,        // function: register with Firebase
    singInUser,        // function: login with Firebase
    signOutUser,       // function: logout
    signInWithGoogle,  // function: Google OAuth
};
```

### Using in Components
```javascript
import { useContext } from 'react';
import AuthContext from '../../context/Authcontext/AuthContext';

const MyComponent = () => {
    const { user, loading, isAdmin, createUser, signOutUser } = useContext(AuthContext);
    
    if (loading) return <div>Loading...</div>;
    
    if (!user) return <div>Please login</div>;
    
    return (
        <div>
            <h1>Welcome {user.displayName}</h1>
            {isAdmin && <div>Admin Features</div>}
            <button onClick={signOutUser}>Logout</button>
        </div>
    );
};
```

---

## 🛠️ File Locations

| File | Purpose |
|------|---------|
| `/src/context/Authcontext/AuthProvider.jsx` | Auth context provider |
| `/src/context/Authcontext/AuthContext.js` | Auth context definition |
| `/src/pages/Register/Register.jsx` | Registration page |
| `/src/pages/Signin/Signin.jsx` | Login page |
| `/src/pages/AdminLogin/AdminLogin.jsx` | Admin login page |
| `/src/firebase/firebase.init.js` | Firebase config |
| `/src/config/schoolConfig.js` | Admin emails config |
| `/src/services/apiService.js` | API client with interceptor |

---

## 🔑 Token Management

### Storing Tokens
```javascript
// After Firebase auth
const token = await getIdToken(firebaseUser);
localStorage.setItem('firebaseToken', token);
```

### Using Tokens
```javascript
// Automatically via axios interceptor
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Clearing Tokens
```javascript
// On logout
localStorage.removeItem('firebaseToken');
delete axios.defaults.headers.common['Authorization'];
```

### Checking Tokens
```javascript
// In browser console
localStorage.getItem('firebaseToken')
axios.defaults.headers
```

---

## ⚠️ Error Codes & Messages

| Error Code | Message | Solution |
|-----------|---------|----------|
| `auth/email-already-in-use` | Email already registered | Use different email |
| `auth/weak-password` | Password too weak | Use 6+ chars, uppercase, lowercase |
| `auth/user-not-found` | No account with this email | Create account first |
| `auth/wrong-password` | Incorrect password | Check caps lock, try again |
| `auth/invalid-email` | Invalid email format | Use valid email |
| `auth/too-many-requests` | Too many attempts | Wait before retrying |
| `auth/user-disabled` | Account disabled | Contact admin |
| `auth/operation-not-allowed` | Auth not available | Check Firebase console |
| `auth/popup-blocked` | Popup was blocked | Allow popups in browser |

---

## 🧪 Testing Scenarios

### Happy Path Tests
- [ ] Register new user → redirects to home
- [ ] Login existing user → redirects to home
- [ ] Google sign-in → redirects to home
- [ ] Admin login → redirects to /admin
- [ ] Page refresh → user stays logged in
- [ ] Logout → redirected to login

### Error Tests
- [ ] Register duplicate email → error shown
- [ ] Login wrong password → error shown
- [ ] Login non-existent email → error shown
- [ ] Admin non-admin access → access denied
- [ ] Expired token → redirects to login

---

## 🔍 Debugging

### Check If User Logged In
```javascript
// In browser console
firebase.auth().currentUser
localStorage.getItem('firebaseToken')
JSON.parse(localStorage.getItem('firebaseToken'))
```

### Check Axios Headers
```javascript
// In browser console
axios.defaults.headers
```

### View Auth Logs
```javascript
// Check browser console for [v0] logs
// Lines starting with [v0] are debug messages
```

### Check Firebase Console
1. Go to firebase.google.com
2. Select project
3. Go to Authentication tab
4. View all registered users
5. Check sign-in activity

---

## 🚨 Common Issues & Fixes

**Issue: 401 Unauthorized on API calls**
```
✓ Check localStorage.firebaseToken exists
✓ Verify token in Authorization header
✓ Ensure Firebase token is valid
✓ Check backend Firebase config
```

**Issue: Registration fails with "email already exists"**
```
✓ Use different email address
✓ Check Firebase console for existing user
✓ Clear browser data and try again
```

**Issue: Google sign-in popup doesn't appear**
```
✓ Check browser popup settings (allow popups)
✓ Verify Google credentials in Firebase console
✓ Check Firefox/Safari - may need different settings
```

**Issue: Can't login after registration**
```
✓ Verify user appears in Firebase console
✓ Check password is exactly as entered (case-sensitive)
✓ Clear browser cache and try again
```

**Issue: User not in MongoDB after login**
```
✓ Check `/api/auth/register` endpoint logs
✓ Verify backend API_URL is correct
✓ Check backend Firebase token verification
✓ Check MongoDB connection
```

---

## 📊 State Flow

```
App Init
    ↓
AuthProvider mounts
    ↓
onAuthStateChanged listener setup
    ↓
Check if user logged in (from Firebase)
    ├─ Yes: Get token, set user, determine role
    └─ No: Clear data
    ↓
App renders with auth context
    ↓
Components can access user, loading, isAdmin, etc.
    ↓
User clicks login/register/google
    ↓
Component calls context function
    ↓
Context handles Firebase auth
    ↓
Token stored in localStorage
    ↓
axios header updated with token
    ↓
User state updated
    ↓
Component re-renders
```

---

## 🔗 API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/register` | POST | Firebase | Sync Firebase user to MongoDB |
| `/auth/verify` | POST | Firebase | Verify Firebase token |
| `/auth/me` | GET | Bearer | Get current user profile |
| `/auth/profile` | PUT | Bearer | Update user profile |
| `/auth/notifications` | PUT | Bearer | Update notification preferences |

---

## 💾 Data Storage

### localStorage
```javascript
{
    firebaseToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjExMjM..."
}
```

### Firebase Auth
```javascript
{
    uid: "user123abc",
    email: "user@zetech.ac.ke",
    displayName: "John Doe",
    photoURL: "https://...",
    emailVerified: false,
    // ... other Firebase properties
}
```

### MongoDB Users
```javascript
{
    _id: ObjectId("..."),
    uid: "user123abc",
    email: "user@zetech.ac.ke",
    displayName: "John Doe",
    profileImage: "https://...",
    role: "student",
    authProvider: "firebase",
    location: "Nairobi",
    createdAt: ISODate("2024-03-26T10:00:00Z")
}
```

---

## 📝 Logging & Monitoring

### Debug Logs in Console
All auth operations log with `[v0]` prefix:
```
[v0] Starting Firebase user creation for: user@zetech.ac.ke
[v0] Firebase user created successfully: user123abc
[v0] Firebase ID token obtained
[v0] Registering user in MongoDB
[v0] Firebase profile updated
```

### Firebase Console Monitoring
- Authentication tab shows all users
- Sign-in activity shows login history
- Email users vs. Google users breakdown

### Backend Logs
- Check logs for `/api/auth/register` calls
- Monitor token verification failures
- Track MongoDB write operations

---

## 🎯 Implementation Checklist

- [x] Firebase email/password auth working
- [x] Firebase Google OAuth working
- [x] MongoDB user sync working
- [x] Token management working
- [x] Admin role system working
- [x] Error handling user-friendly
- [x] Session persistence working
- [x] Loading states working
- [x] Logout working
- [x] Documentation complete

---

## 📞 Support Resources

- Firebase Docs: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com
- See documentation files for detailed guides
- Check browser console for [v0] debug messages
- Review backend logs for API issues

---

**Quick Links to Full Documentation:**
- FIREBASE_AUTH_IMPLEMENTATION.md - Full guide
- COMPLETE_AUTH_CODE.md - All code
- AUTH_SETUP_CHECKLIST.md - Deployment checklist
- AUTHENTICATION_SUMMARY.md - Overview
