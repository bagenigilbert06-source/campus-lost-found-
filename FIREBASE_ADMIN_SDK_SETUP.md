# Firebase Admin SDK Setup Guide

## Problem
Backend is returning 401 Unauthorized on all API requests because Firebase Admin SDK credentials are not configured.

## Solution: Get Service Account Credentials from Firebase Console

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the ⚙️ **gear icon** (Project Settings) → **Service Accounts**

### Step 2: Generate New Private Key
1. In the "Service Accounts" tab, click **"Generate New Private Key"**
2. A JSON file downloads with your credentials

### Step 3: Extract the Required Values

Open the downloaded JSON file and copy these exact values:

```json
{
  "project_id": "← COPY THIS → FIREBASE_PROJECT_ID",
  "client_email": "← COPY THIS → FIREBASE_CLIENT_EMAIL",
  "private_key": "← COPY THIS → FIREBASE_PRIVATE_KEY"
}
```

### Step 4: Add to Render Backend

On Render dashboard:
1. Go to your backend service
2. Click **Environment** (sidebar)
3. Add these 3 environment variables:

#### FIREBASE_PROJECT_ID
```
your-firebase-project-id
```
Example: `campus-lost-found`

#### FIREBASE_CLIENT_EMAIL
```
firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

#### FIREBASE_PRIVATE_KEY
⚠️ **IMPORTANT**: The private key has newlines. In Render, paste the ENTIRE key exactly as it appears in the JSON:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQE...
...
...XyZ/abc123==
-----END PRIVATE KEY-----
```

✅ **Render will automatically handle the newlines correctly**

### Step 5: Redeploy

After adding environment variables:
1. Your service might auto-redeploy (check the "Events" tab)
2. If not, click **"Manual Deploy"** button on the service page
3. Wait for the deployment to complete

### Step 6: Test

Once deployed, test the health endpoint:
```bash
curl https://campus-lost-found-backend-ectt.onrender.com/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

Then login on your frontend - it should work now!

## Troubleshooting

### Still getting 401?
1. Clear browser cache and localStorage
2. Log out and log back in
3. Check Render logs for Firebase initialization errors:
   ```
   tail -f /var/log/render-app.log
   ```

### Private key errors?
- Make sure the entire key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`) is in one environment variable
- Don't break it into multiple lines
- Vercel/Render automatically handle `\n` in the JSON

### Can't find your Firebase Project ID?
Go to Firebase Console → Project Settings → General tab
Your Project ID is at the top of the page

## Security Note
⚠️ Never commit these credentials to git. They're already in `.gitignore` but never paste them directly in code.
