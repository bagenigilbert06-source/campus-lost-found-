# NPM Install Fix Guide

## Your npm install is stuck! Here's how to fix it:

### STOP THE STUCK PROCESS
Press `Ctrl+C` in your terminal to stop the frozen npm install.

---

## Solution 1: Quick Fix (RECOMMENDED)

```bash
cd backend

# Clear npm cache
npm cache clean --force

# Delete lock file and node_modules
rm -rf package-lock.json node_modules

# Try install with verbose output (you'll see it working)
npm install --verbose
```

**Windows:**
```bash
cd backend
npm cache clean --force
rmdir /s /q node_modules
del package-lock.json
npm install --verbose
```

---

## Solution 2: Use npm with legacy settings

```bash
cd backend
npm install --legacy-peer-deps
```

---

## Solution 3: Use pnpm instead (FASTER)

If npm keeps failing, use pnpm (much faster and more reliable):

```bash
# Install pnpm globally if you don't have it
npm install -g pnpm

# Use pnpm to install
cd backend
pnpm install
```

---

## Solution 4: Clean install with timeout increase

```bash
cd backend
npm install --fetch-timeout=120000 --fetch-retry-mintimeout=10000 --fetch-retry-maxtimeout=120000
```

---

## Solution 5: Manual step-by-step

If all above fails, install dependencies manually:

```bash
cd backend

# Core dependencies
npm install express@^4.18.2 firebase-admin@^12.0.0 mongoose@^8.0.0

# Utility packages
npm install cors@^2.8.5 dotenv@^16.3.1 helmet@^7.1.0

# Validation and auth
npm install express-validator@^7.0.0 bcryptjs@^2.4.3 jsonwebtoken@^9.1.2

# Email and rate limiting
npm install nodemailer@^6.9.7 express-rate-limit@^7.1.5

# Dev dependencies
npm install --save-dev typescript@^5.2.2 ts-node@^10.9.1 @types/node@^20.8.0 @types/express@^4.17.21
```

---

## What I've already done to help:

✅ Created `.npmrc` file with optimized npm settings
✅ Increased fetch timeouts
✅ Enabled legacy peer deps support

---

## After npm install completes:

```bash
npm run dev
```

This will start your backend on `http://localhost:3001`

---

## Still stuck?

Try this nuclear option:

```bash
# Windows
rd /s /q C:\Users\YourUsername\AppData\Roaming\npm-cache
npm cache clean --force

# Mac/Linux
rm -rf ~/.npm
npm cache clean --force

# Then try install again
npm install
```

---

**Most Common Cause:** Network timeout or registry issue
**Most Likely Solution:** Use Solution 3 (pnpm) - it's the future!
