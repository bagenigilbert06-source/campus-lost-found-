# Vercel Deployment - Environment Variables Reference

## Backend Deployment URL
**Current URL**: https://backend-pdrd7bcvo-projects66.vercel.app

## Status
✅ Backend project linked to Vercel
❌ Build failed (missing environment variables)
⏳ Need to add env vars → redeploy

---

## How to Add Environment Variables

### Option 1: Vercel Dashboard (Recommended for multiple variables)
1. Go to: https://vercel.com/projects66/backend/settings/environment-variables
2. Click "Add New" button
3. Enter each variable below (use "Production" environment)

### Option 2: Vercel CLI (Quick for single variables)
```bash
cd backend
npx vercel env add VARIABLE_NAME production
# Then paste the value when prompted
```

---

## Environment Variables to Add

Add all of these with environment set to **Production**:

```
MONGODB_URI
mongodb+srv://infocontactgilbertdev_db_user:junior2020@cluster0.ryskebn.mongodb.net/?appName=Cluster0

FIREBASE_TYPE
service_account

FIREBASE_PROJECT_ID
mizizzi-1613c

FIREBASE_PRIVATE_KEY_ID
d1ebab1a9540a675113a45a00436ba7a4f3b6ffe

FIREBASE_PRIVATE_KEY
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCzNO63uAQoTq9b
WMmbYN//wx2Nf5R2bs9EFPxOsJZ+XzOoM60HOqoiVPDs7rTqtqg+g5Vw3whm/HhE
4vwPOh3D93v8oGEzmVYtDZHp1EToZYvClNCDHqiIOC1jyGA/t4p9XRQNWJ1O6nXQ
b3k4fegoDH16W/wRtzdXQEn9QmfRWmQ9q8dcH5Pffvs8p2nDoS5u+rfv9hDq8Vcb
l5BOeqyQcQJc7mw+uKRH6GI9CAtcUyRLNMkqGlzwn9YPCwwIkeJAaoJUVcyjPpGn
xuUsY7f8VGx47QPqbHJut7gRlLQyoy6zpo5CQ+0ni2AVt2odZuYwv/kbB3QANupy
pgMqTu8bAgMBAAECggEAUGldAGT6wJdmCggSFr1mZZ5IgXiQxn+8UyFTgX+tV7Ei
PcRKTKcfNl6E6NvHpFYnsj1a7hW18HgzAz4SukZqmsdPBDF2zC9uwrKHGbQc42bF
Sp953IwCNXV3sIF15sFVzCDa4Y40r/d2u/t5Gkcsx+Oq3h+uQMjEdUssqA6HBSHY
zrML+ZmC4X8AIkXlAhtIRm4ET9BCPy4ftw3Dgi5uXY8K5HUTsaj+l+aGbjS5hw4k
8g7VW4bDmMouOe1ScQJB3MJG2ojJqFzhpCbDP7z3jZAn9Z8B5fCavVKTFU4biy8Y
y/3qiEJQD2/pw2n2sZh8pc6g43y4dBObLt+s5yEEeQKBgQDgpxJnhjvupGoorxCM
P1F7JIEq9Q5+Gabw9IeGopAF+GGGa215FSGv6X54KcpwBi65WyE/ER/d+W8wTvM9
0UVmDRzA9A7JJyLQQXDX8lbKK5YAx7W+S4eTlhpuTH7EkQ2s+Lcuvig2Zw6C2cXP
18VBa6z87KFFga782fYBt6ih5wKBgQDMNndvTt9vwN37SsH0Ys06ou2Nc6BRtvQa
bDSfKU0YcYShAbRqOE31Hk5Zoyg6honaaKgpzcwqKU8biJvPqIGtJF9sCeEbPZTb
PLQO0v51Qh3ukAf6yhg3wVDlCCr8r8/Q1eO2RcvZAExzoD/3wSjc1rwrLkWft/XF
Tbn5rPWKrQKBgQCWhzwsw+Qalm5PjmYvIyosshwetY8dbYDPyXmZ/Ak3BuQKFqeG
z2MAJRtJ1u6/O1VJe8d+I7JPoRggrXYNANFYfQa8P4w8uo14L7E18Tq4QpZDNY4Q
0Tkp6hURvQ3gFjWspgbQOjhlo440nUkPaEvS9xw1aTTyht/CqyVMp0xGFwKBgFNr
3JZnzfbE/ulsvJas1dGiRRCHr3IyHr28fjKWmJvno5pyK9VIcvAzFSag9AoUc7P5
FNke7Mw8W8iPobbOy0qDlUd5MbADFBALWDLGFpSoEbomtFvKuuHr4rPtBkJ7P5W8
Cm2nTYK0EIcba4Y2Lg8o2W16VY7Ng2S6P8Ky2QtxAoGBAJVBcH5HC4d9JYAQR9xB
92vvbgb1KlyQm1MeycV8q7ZQZJKmg+CTamDDy1G8jpgVI9uyKxKvs6ZeJ0WWggJl
o+F7oz9sWPYjOgeQ/g8ggdz16tSkdhRZEuIw1ci7dJtCJcIdmVBWsBxommb/hG61
jwff9Id4jYAGTTo+t1lbcMG5
-----END PRIVATE KEY-----

FIREBASE_CLIENT_EMAIL
firebase-adminsdk-fbsvc@mizizzi-1613c.iam.gserviceaccount.com

FIREBASE_CLIENT_ID
104754232610222300630

FIREBASE_AUTH_URI
https://accounts.google.com/o/oauth2/auth

FIREBASE_TOKEN_URI
https://oauth2.googleapis.com/token

FIREBASE_AUTH_PROVIDER_X509_CERT_URL
https://www.googleapis.com/oauth2/v1/certs

FIREBASE_CLIENT_X509_CERT_URL
https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mizizzi-1613c.iam.gserviceaccount.com

NODE_ENV
production

FRONTEND_URL
https://mizizzi-1613c.web.app

LOG_LEVEL
info

GEMINI_API_KEY
AIzaSyAKdfIkrEPgd6cyCAa4MUqMbC3K20ye7ns

GEMINI_MODEL
gemini-2.5-flash

GEMINI_REQUEST_TIMEOUT
30000

GEMINI_MAX_TOKENS
500
```

---

## Next Steps After Adding Variables

1. ✅ Add all environment variables to Vercel
2. ⏳ Go to: https://vercel.com/projects66/backend
3. ⏳ Click "Deployments" tab
4. ⏳ Redeploy the latest commit → should build successfully now
5. ⏳ Copy the deployment URL (will be something like `https://campus-api-xxx.vercel.app`)
6. ⏳ Update frontend API URL in Firebase deployment
