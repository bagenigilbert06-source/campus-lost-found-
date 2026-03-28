# Backend - Quick Start (5 minutes)

## Option 1: Automated Startup (Recommended)

### macOS/Linux:
```bash
cd backend
chmod +x start.sh
./start.sh
```

### Windows:
```bash
cd backend
start.bat
```

The script will:
- ✓ Check if Node.js is installed
- ✓ Install dependencies automatically
- ✓ Create .env file from template
- ✓ Start the backend server

Done! Server runs on `http://localhost:3001`

---

## Option 2: Manual Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create .env File
```bash
cp .env.example .env
```

Edit `.env` and add:
- MongoDB connection string
- Firebase credentials
- Email configuration (optional)

### 3. Start Server
```bash
npm run dev
```

You'll see:
```
[Backend] Initializing server...
[Backend] Connected to MongoDB
[Backend] Firebase initialized
[Backend] Server running on port 3001
```

---

## Verify It's Running

Open browser: `http://localhost:3001/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-03-13T..."
}
```

---

## What You Need First

### 1. MongoDB (Choose One)

**Option A: Local MongoDB**
- Download: https://www.mongodb.com/try/download/community
- Start: `mongod`
- Connection: `mongodb://localhost:27017/lost-found`

**Option B: MongoDB Atlas (Cloud - Free)**
- Create account: https://www.mongodb.com/cloud/atlas
- Create cluster (free tier)
- Get connection string
- Use in `.env`

### 2. Firebase Project

1. Go to: https://console.firebase.google.com
2. Create new project
3. Go to: Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy JSON values to `.env`

### 3. (Optional) Email Service

For sending notifications:
- Use Gmail with app password
- Or SendGrid API key
- Or any email service

---

## Environment Variables (.env)

```env
# Must Have
PORT=3001
MONGODB_URI=mongodb://localhost:27017/lost-found
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."

# Optional
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `Cannot find module` | Run `npm install` |
| `Port 3001 in use` | Kill process or change PORT in .env |
| `MongoDB connection failed` | Check MONGODB_URI is correct |
| `Firebase initialization failed` | Verify Firebase credentials in .env |
| `Cannot connect to backend` | Make sure `npm run dev` is still running |

---

## Next Steps

1. Backend is running on `http://localhost:3001`
2. Start frontend: `npm run dev` (in root directory)
3. Frontend connects to backend automatically
4. Test endpoints with Postman or browser
5. Deploy when ready

---

## Need Help?

See detailed guides:
- **Setup Details**: `SETUP_AND_RUN.md`
- **Architecture**: `../BACKEND_ARCHITECTURE.md`
- **Integration**: `../BACKEND_INTEGRATION_GUIDE.md`
- **Deployment**: `../DEPLOYMENT_GUIDE.md`

---

## Port Already in Use?

If port 3001 is taken, change it in `.env`:

```env
PORT=3002
```

Then restart with `npm run dev`
