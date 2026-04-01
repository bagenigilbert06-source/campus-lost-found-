# API Key & Credentials Security Guide

## 🚨 CRITICAL: Your API Key Was Leaked

Your Gemini API key (`AIzaSyB-Pv_hRZmMgQ7dGCKVVTtOgjzp_pVBa4I`) was exposed in the `.env.example` file committed to version control. Other credentials are also exposed.

## Immediate Actions

### 1. Revoke All Exposed Credentials

#### Gemini API Key
```bash
# Go to: https://aistudio.google.com/app/apikey
# Delete the exposed key: AIzaSyB-Pv_hRZmMgQ7dGCKVVTtOgjzp_pVBa4I
# Create a NEW API key
# Copy the new key
```

#### Firebase Credentials
```bash
# Go to: https://console.firebase.google.com
# Select your project → Project Settings → Service Accounts
# Click "Generate New Private Key"
# Download and save the JSON file
# Copy the following values:
# - FIREBASE_PROJECT_ID
# - FIREBASE_CLIENT_EMAIL
# - FIREBASE_PRIVATE_KEY (convert \\n to actual newlines)
```

#### MongoDB Credentials
```bash
# Go to: https://cloud.mongodb.com/v2
# Select your project → Database Access
# Click the "Edit" button for your user
# Change password and update MONGODB_URI connection string
```

### 2. Update Environment Variables

**Create/Update `backend/.env.local`** (never commit this file):

```bash
# Database
MONGODB_URI=mongodb+srv://your_new_username:your_new_password@cluster.mongodb.net/campus-lost-found

# Firebase (from downloaded JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Gemini (NEW KEY from step 1)
GEMINI_API_KEY=your-new-gemini-api-key

# Other config
GEMINI_MODEL=gemini-2.0-flash
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=3001
```

### 3. Test the New Configuration

```bash
cd backend
npm install
npm run build
npm run dev
```

Visit: `http://localhost:3001/api/health`

Open app and test Gemini chat: Should work without 403 errors

### 4. Deploy New Credentials to Render

For production deployment:

1. Go to Render Dashboard → Select `campus-lost-found-backend`
2. Settings → Environment
3. Update all credentials:
   - `MONGODB_URI`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `GEMINI_API_KEY` (the NEW one)
4. Deploy the service

### 5. Clean Git History (Optional but Recommended)

If you want to remove the leaked credentials from git history:

```bash
# Option A: Using BFG (recommended for large repos)
# Install: brew install bfg

bfg --replace-text passwords.txt .

# Then:
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Option B: Using git filter-branch (slower)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch backend/.env.example' \
  --prune-empty --tag-name-filter cat -- --all

# Verify and force push (DANGEROUS for shared repos)
git push origin --force --all
```

## Security Best Practices Going Forward

### DO:
✅ Store real credentials in `.env.local` (local development)
✅ Store real credentials in Render Environment Variables (production)
✅ Keep `.env` files in `.gitignore`
✅ Use `.env.example` with placeholder values only
✅ Rotate credentials regularly
✅ Use strong, unique passwords
✅ Limit API key scopes/permissions to what's needed

### DON'T:
❌ Commit `.env` files to git
❌ Commit real credentials to `.env.example`
❌ Share API keys in chat/email/slack
❌ Use the same key across multiple projects/environments
❌ Hardcode secrets in source code
❌ Log sensitive data

## Environment Variable Reference

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `MONGODB_URI` | Database connection | `mongodb+srv://user:pass@cluster.net/db` | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project | `your-project-id` | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account | `firebase-adminsdk-@project.iam.gserviceaccount.com` | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase auth key | `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n` | Yes |
| `GEMINI_API_KEY` | Google AI API | `AIzaSy...` | Yes |
| `GEMINI_MODEL` | AI model version | `gemini-2.0-flash` | No (default shown) |
| `FRONTEND_URL` | Frontend domain for CORS | `https://example.com` | Yes (production) |
| `NODE_ENV` | Environment | `production` or `development` | Yes |
| `PORT` | Server port | `3001` | No (default 3001) |

## Testing API Keys

### Test Gemini API
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

### Test MongoDB Connection
```bash
npm install -g mongodb-shell
mongosh "your-connection-string"
```

### Test Firebase Admin SDK
```bash
npm run build
# Check logs for "[Firebase] initialized successfully"
```

## References

- [Google AI Studio API Keys](https://aistudio.google.com/app/apikey)
- [Firebase Service Accounts](https://console.firebase.google.com)
- [MongoDB Atlas Connection](https://cloud.mongodb.com)
- [OWASP: Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
