# Firebase Authentication Setup Checklist

## Pre-Deployment Checklist

### Firebase Configuration
- [ ] Firebase project created at console.firebase.google.com
- [ ] Authentication enabled (Email/Password and Google)
- [ ] All Firebase environment variables in `.env.local`:
  - [ ] VITE_FIREBASE_API_KEY
  - [ ] VITE_FIREBASE_AUTH_DOMAIN
  - [ ] VITE_FIREBASE_PROJECT_ID
  - [ ] VITE_FIREBASE_STORAGE_BUCKET
  - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
  - [ ] VITE_FIREBASE_APP_ID
- [ ] Google OAuth credentials configured in Firebase
- [ ] Google provider enabled for Sign-In

### Backend Configuration
- [ ] MongoDB connection string set
- [ ] API_URL environment variable set
- [ ] Firebase credentials for backend auth verification
- [ ] CORS configured to accept frontend origin
- [ ] `/api/auth/register` endpoint working
- [ ] `/api/auth/me` endpoint working
- [ ] `/api/auth/verify` endpoint working

### Application Configuration
- [ ] `/src/config/schoolConfig.js` updated with:
  - [ ] School name
  - [ ] Short name
  - [ ] Admin email addresses
- [ ] `.env.local` has API_URL pointing to backend

### Code Review
- [ ] AuthProvider.jsx uses Firebase functions
- [ ] Register.jsx calls createUser()
- [ ] Signin.jsx calls singInUser()
- [ ] AdminLogin.jsx calls singInUser() with admin check
- [ ] Error handling maps Firebase error codes
- [ ] Loading states work properly

## Development Testing

### Registration Flow
- [ ] Register page loads
- [ ] Validates password requirements
- [ ] Creates Firebase user on submit
- [ ] Syncs user to MongoDB
- [ ] Shows success toast
- [ ] Redirects to home
- [ ] localStorage has firebaseToken
- [ ] User data shows on home page

### Login Flow  
- [ ] Signin page loads
- [ ] Firebase login works
- [ ] Token stored in localStorage
- [ ] Redirects to home on success
- [ ] axios header has Bearer token
- [ ] API calls include token
- [ ] User profile loads on home

### Admin Login Flow
- [ ] Admin login page loads
- [ ] Admin email logins work
- [ ] Redirects to /admin dashboard
- [ ] Non-admin email login denied
- [ ] Shows "no admin privileges" error
- [ ] Redirects to / when denied

### Google Sign-In Flow
- [ ] Google button appears on register/signin
- [ ] Popup opens on click
- [ ] Sign-in with Google account works
- [ ] Firebase user created
- [ ] MongoDB user synced
- [ ] Token stored in localStorage
- [ ] Redirects appropriately
- [ ] User data shows correctly

### Session Persistence
- [ ] Login user
- [ ] Refresh page (F5)
- [ ] User still logged in
- [ ] No login screen shown
- [ ] Dashboard loads immediately
- [ ] API calls work (have token)
- [ ] Logout and refresh
- [ ] Login screen shown

### Error Scenarios
- [ ] Duplicate email registration → error shown
- [ ] Weak password registration → validation error
- [ ] Wrong password login → error shown
- [ ] Non-existent email login → error shown
- [ ] Admin role denied → error shown
- [ ] All errors are user-friendly

### Token & Auth
- [ ] localStorage.firebaseToken exists after login
- [ ] Token sent in Authorization header
- [ ] Token valid for API requests
- [ ] Token expires appropriately (refreshed automatically)
- [ ] Logout clears token
- [ ] logout clears axios header

## Staging/Production Checklist

### Environment Setup
- [ ] Firebase production credentials set
- [ ] Backend API pointing to production URL
- [ ] HTTPS enabled on frontend
- [ ] HTTPS enabled on backend
- [ ] CORS whitelist updated with production domain
- [ ] Database backed up before deployment

### Security Review
- [ ] Firebase rules reviewed
- [ ] No hardcoded credentials
- [ ] Sensitive vars in environment only
- [ ] HTTPS enforced for all auth
- [ ] OAuth redirect URLs whitelisted
- [ ] Admin email list reviewed

### Performance
- [ ] Token refresh works smoothly
- [ ] No repeated login prompts
- [ ] Session restoration fast
- [ ] API calls responsive
- [ ] No memory leaks on logout

### Monitoring
- [ ] Firebase console accessible
- [ ] Auth event logging enabled
- [ ] Backend logging configured
- [ ] Error tracking setup (Sentry/similar)
- [ ] MongoDB backup automated

## Post-Deployment Testing

### User Registration
- [ ] New user can register
- [ ] Receives confirmation (if applicable)
- [ ] Profile visible in admin panel
- [ ] Can immediately login after registration

### User Login
- [ ] Existing users can login
- [ ] Sessions persist across page reloads
- [ ] Can access protected pages
- [ ] Can logout successfully

### Admin Functions
- [ ] Admin users can access admin panel
- [ ] Non-admin users cannot access admin panel
- [ ] Admin operations work (create/edit/delete items)
- [ ] User management works

### Google OAuth
- [ ] Google sign-in works
- [ ] User profile synced correctly
- [ ] Can login with Google
- [ ] Can access app features

### API Integration
- [ ] All API endpoints authenticated
- [ ] No 401 errors (unless token truly invalid)
- [ ] User data loads correctly
- [ ] Searches/filters work
- [ ] Item creation/updates work

### Error Handling
- [ ] Invalid token → redirects to login
- [ ] Network error → shows error message
- [ ] Server error → shows error message
- [ ] User not found → clear error message

## Troubleshooting Reference

### Auth Won't Work
1. Check Firebase credentials in `.env.local`
2. Verify Firebase project has Email/Password auth enabled
3. Check browser console for errors
4. Clear localStorage and try again

### Google Sign-In Won't Work
1. Verify Google OAuth credentials in Firebase
2. Check Google provider enabled in Firebase console
3. Verify redirect URLs in Google Cloud Console
4. Clear cache and try incognito mode

### API Gets 401
1. Check localStorage.firebaseToken exists
2. Verify token not expired (check browser DevTools)
3. Check backend Firebase configuration
4. Verify CORS headers allow requests

### Users Can't Register
1. Check email not already in Firebase
2. Verify password meets requirements (6+, upper, lower)
3. Check backend `/api/auth/register` endpoint logs
4. Verify MongoDB connection

### Admin Access Denied
1. Verify email in schoolConfig.adminEmails
2. Check Firebase user created with correct email
3. Verify email hasn't changed
4. Check backend role determination logic

---

## Quick Reference

| Component | Function | Auth Method |
|-----------|----------|-------------|
| Register | createUser() | Firebase Email |
| Signin | singInUser() | Firebase Email |
| AdminLogin | singInUser() + check isAdmin | Firebase Email |
| All | signInWithGoogle() | Firebase OAuth |

| Storage | Key | Contains |
|---------|-----|----------|
| localStorage | firebaseToken | Firebase ID token |
| Axios Header | Authorization | Bearer {token} |
| AuthContext | user | Firebase user object |
| AuthContext | userRole | 'admin' or 'student' |
| AuthContext | isAdmin | true/false |

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/auth/register | POST | Sync Firebase user to MongoDB |
| /api/auth/verify | POST | Verify Firebase token |
| /api/auth/me | GET | Get current user profile |
| /api/auth/profile | PUT | Update user profile |

---

## Support

If authentication isn't working:
1. Check all environment variables
2. Verify Firebase console settings
3. Review browser console for errors
4. Check backend logs for token verification errors
5. Verify database connections
6. Clear cache and retry

For Google Sign-In issues:
1. Verify redirect URLs in Google Cloud Console match Firebase
2. Check Google project has OAuth credentials
3. Verify Firebase has Google provider enabled
4. Test in incognito mode (no cache/cookies)
