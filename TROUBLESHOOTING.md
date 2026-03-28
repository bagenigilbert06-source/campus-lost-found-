## Troubleshooting Manual Email/Password Authentication

### Issue: "Network Error" or "ERR_CONNECTION_REFUSED" when trying to login/signup

**Cause:** Backend server is not running

**Solution:**
1. Make sure you're in the project root directory
2. Start the backend server:
   ```bash
   cd backend
   npm install  # if not already done
   npm run dev
   ```
3. In another terminal, start the frontend:
   ```bash
   npm run dev
   ```
4. Frontend should be at http://localhost:5173
5. Backend should be at http://localhost:3001

**Or use the startup script (Linux/Mac):**
```bash
chmod +x start.sh
./start.sh
```

---

### Issue: "Firebase: Error (auth/operation-not-allowed)"

**Cause:** This was the original error when trying to use Firebase's email/password auth method

**Solution:** This should be fixed now. If you still see this error:
1. Make sure you're using the latest version of the code
2. Clear your browser cache
3. Check that the login/signup forms are calling `signInWithEmail` or `registerWithEmail`
4. Not calling Firebase's `signInWithEmailAndPassword`

---

### Issue: "Cannot connect to MongoDB" in backend console

**Cause:** MongoDB is not running locally

**Solution:**
1. Install MongoDB Community Edition
2. Start MongoDB:
   - **Windows:** `mongod` (if added to PATH)
   - **Mac:** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`
3. Verify MongoDB is running on port 27017:
   ```bash
   mongo admin --eval "db.version()"  # or
   mongosh admin --eval "db.version()"
   ```

---

### Issue: Backend starts but login fails with "400 Bad Request"

**Possible Causes:**
1. Email validation failed
   - Make sure email is valid format (user@domain.com)
2. Password is too short
   - Password must be at least 6 characters
3. Display name is empty (for signup)
   - Required field when registering

**Check backend console for detailed error message**

---

### Issue: Signup succeeds but login fails with "Invalid credentials"

**Cause:** Password mismatch or database issue

**Solutions:**
1. Make sure you're using the exact same password as during signup
2. Check MongoDB to verify user was saved:
   ```bash
   mongosh zetech-lost-found
   db.users.find()
   ```
3. Try logging out (clear localStorage) and signing up again with a fresh account

---

### Issue: Email/password login works but role is wrong (admin sees student dashboard)

**Cause:** Role determination is based on email address

**Solution:**
- Use admin email to get admin role: `bagenigilbert@zetech.ac.ke`
- Use non-admin email to get student role: `student@example.com`
- Admin emails are defined in backend `LocalAuthService.ts`

---

### Issue: Token expires too quickly

**Cause:** JWT token is set to expire in 7 days (default)

**Solution:**
1. Edit backend `.env.local` to add `JWT_EXPIRES_IN=30d` (if needed)
2. Or extend token expiration in `LocalAuthService.ts` line 8
3. Current setting is 7 days, which is reasonable for development

---

### Issue: Google login works but email/password doesn't

**Possible Causes:**
1. Backend is running but not on port 3001
2. Frontend API URL is wrong
3. CORS is blocking the request

**Check:**
1. Backend console should show POST requests to `/api/auth/local/login`
2. Frontend browser console should show the error details
3. Verify `VITE_API_URL` in `.env.local` matches backend URL

---

### Issue: Can't find LocalAuthService or import errors

**Cause:** Dependencies not installed properly

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json  # Clean install
npm install
npm run dev
```

---

### Issue: "Cannot read properties of undefined (reading 'signInWithEmail')"

**Cause:** AuthContext is not properly provided or imported

**Solution:**
1. Ensure AuthProvider wraps your app in `src/main.jsx`
2. Check that login pages import from AuthContext correctly:
   ```jsx
   const { signInWithEmail } = useContext(AuthContext);
   ```

---

### Quick Verification Checklist

- [ ] MongoDB is running (try: `mongosh`)
- [ ] Backend is running (should see port 3001 in console)
- [ ] Frontend is running (should see port 5173 in console)
- [ ] Both `.env.local` files exist with correct values
- [ ] Browser DevTools shows API calls to http://localhost:3001/api
- [ ] No CORS errors in browser console
- [ ] LocalAuthService is exported correctly in backend
- [ ] AuthProvider wraps the entire app in frontend

---

### Testing API Endpoints Directly

Use curl or Postman to test the API:

```bash
# Test backend health
curl http://localhost:3001/health

# Register a user
curl -X POST http://localhost:3001/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/local/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

### Enable Debug Logging

Add to AuthProvider to see auth state changes:
```jsx
console.log('[v0] Auth state:', { user, userRole, authStatus, authProvider });
```

Add to login pages:
```jsx
console.log('[v0] Attempting local login with:', { email, password: '***' });
```

Then check browser console for detailed logs during login attempts.
