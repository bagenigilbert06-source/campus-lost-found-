# Render Deployment Guide

## Backend Deployment to Render

### Prerequisites
- MongoDB Atlas account and cluster
- Firebase project with authentication enabled
- Render account

### 1. Prepare Backend for Render

The backend is already configured for Render deployment:
- Uses `process.env.PORT` for port binding
- Binds to `0.0.0.0` for external access
- Standard Express server (not serverless)

### 2. Environment Variables

Set these environment variables in Render:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-lost-found

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# CORS
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Gemini AI (optional)
GEMINI_MODEL=gemini-2.0-flash
GEMINI_REQUEST_TIMEOUT=30000

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Environment
NODE_ENV=production
```

### 3. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `campus-lost-found-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend/`
5. Add environment variables from step 2
6. Click "Create Web Service"

### 4. Update Frontend

Update your frontend's API base URL to point to the Render backend URL.

### 5. Admin Setup

To set up admin users:
1. Have users sign up with Firebase Auth
2. Manually update their role in MongoDB Atlas to 'admin'
3. Or create a database script to set admin roles

### Troubleshooting

- **Port issues**: Ensure `PORT` environment variable is set
- **CORS errors**: Verify `FRONTEND_URL` matches your frontend domain
- **Database connection**: Check MongoDB Atlas IP whitelist and credentials
- **Firebase auth**: Ensure Firebase Admin SDK credentials are correct

### Health Check

Test the deployment:
```bash
curl https://your-render-backend-url.onrender.com/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`