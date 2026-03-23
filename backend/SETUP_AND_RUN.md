# Backend Setup and Run Guide

## Prerequisites

Make sure you have installed:
- **Node.js** 18+ and **npm** (or pnpm)
- **MongoDB** (local or Atlas cloud instance)
- **Firebase Project** with service account key

## Step 1: Navigate to Backend Directory

```bash
cd backend
```

## Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

This will install all required packages:
- Express.js (API framework)
- MongoDB & Mongoose (database)
- Firebase Admin SDK (authentication)
- TypeScript (for type safety)

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Required Environment Variables:

**MongoDB Setup:**
```
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/lost-found

# Option 2: MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lost-found?retryWrites=true&w=majority
```

**Firebase Setup:**
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Copy the JSON content and paste the values into `.env`

**Email Configuration (Optional):**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```
*Get app password from: https://myaccount.google.com/apppasswords*

**Other Settings:**
```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

## Step 4: Start the Backend

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Build:
```bash
npm run build
npm start
```

## Expected Output

When running successfully, you should see:

```
[Backend] Initializing server...
[Backend] Connected to MongoDB
[Backend] Firebase initialized
[Backend] Server running on port 3001
[Backend] Environment: development
```

## Verify Backend is Running

Open your browser and visit:
```
http://localhost:3001/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-03-13T10:30:00.000Z"
}
```

## API Endpoints

Once running, your backend provides these endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/notifications` - Update notification preferences

### Items
- `GET /api/items` - Get all items (with filters)
- `GET /api/items/:id` - Get specific item
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `GET /api/items/user/:userId` - Get user's items
- `POST /api/items/:id/claim-with-notification` - Claim found item

### Search & Matching
- `GET /api/search` - Search items (category, location, keyword)
- `GET /api/matches` - Get all matches
- `GET /api/items/:id/matches` - Get matches for specific item

### Notifications
- `POST /api/notifications/send-test` - Send test notification
- `GET /api/notifications/history` - Get notification history

## Troubleshooting

### Error: Cannot find module 'mongoose'
**Solution:** Run `npm install` in the backend directory

### Error: MONGODB_URI not found
**Solution:** Make sure `.env` file exists and has MONGODB_URI set

### Error: Firebase initialization failed
**Solution:** Check Firebase credentials in `.env` file are correct (no extra spaces or line breaks)

### Error: Port 3001 already in use
**Solution:** Change PORT in `.env` or kill process using port 3001:
```bash
# On macOS/Linux
lsof -ti:3001 | xargs kill -9

# On Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Connection to localhost:3001 refused
**Solution:** Make sure backend is running and not crashed. Check console output for errors.

## Running Both Frontend and Backend

Open two terminal windows:

**Terminal 1 - Frontend:**
```bash
cd ../
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

## Next Steps

1. The backend is now running and connected to MongoDB
2. Update the frontend API URL to `http://localhost:3001` in your API service
3. Test API endpoints using Postman or curl
4. Deploy to Vercel when ready (see DEPLOYMENT_GUIDE.md)

## Useful Commands

```bash
# Check if MongoDB is running
mongosh

# View logs in real-time
npm run dev -- --verbose

# Run type checking
npx tsc --noEmit

# Run linter
npm run lint

# Kill all Node processes
pkill -f node
```

## Support

If you encounter issues:
1. Check the error message in the console
2. Review `.env` file configuration
3. Ensure MongoDB connection string is correct
4. Check Firebase credentials are valid
5. See `TROUBLESHOOTING.md` for more help
