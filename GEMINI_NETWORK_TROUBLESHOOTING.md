# Troubleshooting Gemini "fetch failed" Error

## What's Fixed
- ✅ AILog validation error (enum mismatch) - Fixed
- ⚠️ "fetch failed" network error - Requires diagnostics

## What "fetch failed" Means
Node.js is unable to establish a connection to Google's Generative AI API. This can happen due to:

1. **Network Connectivity Issues**
   - Server has no internet access
   - Network is blocking outbound connections

2. **DNS Resolution Issues**
   - Cannot resolve `generativelanguage.googleapis.com`
   - Test: `nslookup generativelanguage.googleapis.com`

3. **Firewall/Proxy Issues**
   - Corporate firewall blocking Google APIs
   - Proxy server not configured properly

4. **API Key Issues**
   - Invalid or expired Google API key
   - API key doesn't have required permissions
   - Project has API quotas exhausted

5. **undici/Node.js Issues**
   - Node.js version incompatibility with undici
   - SSL/TLS certificate issues

## Quick Diagnostics

### 1. Check Network Connectivity
```bash
# Test if you can reach Google's API
curl -I https://generativelanguage.googleapis.com

# Or with Node.js
node -e "import http from 'http'; http.get('http://google.com', (r) => console.log(r.statusCode))"
```

### 2. Check DNS Resolution
```bash
nslookup generativelanguage.googleapis.com
# Should return: 142.250.x.x addresses
```

### 3. Check Environment Variables
```bash
# In backend folder
node -e "console.log(process.env.GEMINI_API_KEY)"
```
- Should output your API key (not empty)
- If empty, ensure `.env.local` exists in backend folder

### 4. Test API Key Validity
```bash
# Make a simple curl request with your key
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Say hello"}]
    }]
  }' \
  -H "x-goog-api-key: YOUR_API_KEY"
```

### 5. Check Node.js Version
```bash
node --version
# Should be v18+ for best compatibility with undici
```

### 6. Test with Fallback Service
The system has a fallback AI service (FallbackAIService). If Gemini fails consistently:
- Fallback should automatically activate
- Check if `FALLBACK_AI_ENABLED` is set in `.env.local`
- Check fallback service configuration

## Backend Logs to Monitor
After making these diagnostics, look for detailed logs in the backend console:
```
[Gemini] Generate text error: {
  message: "fetch failed",
  name: "TypeError",
  code: "UNDICI_ERR_CONNECT_TIMEOUT" | "ENOTFOUND" | "ECONNREFUSED"
}
```

## Solutions by Error Type

### ENOTFOUND (DNS Issue)
- Check DNS settings
- Ensure server can access internet
- Corporate networks: configure proxy

### ECONNREFUSED (Connection Refused)
- Google API might be down (check status.page.io/google-cloud)
- Firewall blocking connection
- API key permissions issue

### UNDICI_ERR_CONNECT_TIMEOUT
- Network latency too high
- Increase timeout in `.env.local`: `GEMINI_REQUEST_TIMEOUT=45000`
- Check network stability

### Invalid API Key Error
- Verify key in Google Cloud Console
- Re-generate key if necessary
- Check that Generative AI API is enabled in project

## After Fixing

1. Restart backend: `npm run dev` in backend folder
2. Test with POST request to `/api/gemini/chat`:
```bash
curl -X POST http://localhost:5000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```
3. Response should include `provider: "gemini"` if successful

## Still Having Issues?

Check these files:
- [backend/.env.local](backend/.env.local) - Ensure GEMINI_API_KEY is set
- [backend/src/services/GeminiService.ts](backend/src/services/GeminiService.ts) - API configuration
- [backend/src/routes/gemini.ts](backend/src/routes/gemini.ts) - Error logging endpoint
