# Quick Start: Gemini AI Integration

## 5-Minute Setup

### Step 1: Get Gemini API Key (1 min)
1. Visit: https://aistudio.google.com/app/apikey
2. Click **"Get API Key"**
3. Create a new project if needed
4. Copy your API key

### Step 2: Configure Backend (2 min)
Edit `backend/.env.local` and add your key:

```
GEMINI_API_KEY=paste_your_key_here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_REQUEST_TIMEOUT=30000
GEMINI_MAX_TOKENS=500
```

### Step 3: Install Dependency (Already Done!)
The `@google/generative-ai` package is already installed.

### Step 4: Start Servers (2 min)
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Step 5: Test It! (0 min, it's ready)
1. Open http://localhost:5173
2. Look for the chatbot bubble in bottom right
3. Click it and say "Hi!"
4. Go to post an item - AI assist button appears
5. Search page has smart search suggestions

## ✅ That's It!

Your Gemini integration is now live! Here's what works:

### 🤖 Chatbot Features
- **Landing page**: Click the Gemini bubble to chat
- **Authenticated pages**: Help with the platform
- **Questions it can answer**: "How do I post an item?", "How does claiming work?", etc.

### 🎯 Form Intelligence
- **Post Lost Item**: Click "AI Assist" after filling title & description
- Suggests: Better title, improved description, category recommendations, tags
- **How it works**: AI reads your input, suggests improvements, you choose to accept

### 🔍 Smart Search
- **Search page**: Type in search box, get AI-powered suggestions
- **How it works**: Fixes typos, suggests keywords, offers alternatives
- **Free feature**: Debounced so it doesn't spam API

## Common Questions

**Q: Will this cost me money?**
A: No! You're on Google's free tier (60 requests/min). The app is optimized to use very few tokens per request.

**Q: Does it replace the database search?**
A: No! Gemini improves the search query, but the real database still returns actual items from your MongoDB.

**Q: What if I don't add the API key?**
A: The app still works perfectly! All AI features gracefully disable and show "not configured" messages.

**Q: Is my data safe?**
A: Yes. The API key is backend-only (never exposed to frontend). User messages only go to Google, never stored on your backend.

**Q: Can it see private user data?**
A: No. It only gets what the user types. It can't query your database or see other users' data.

**Q: How do I disable AI features?**
A: Just remove GEMINI_API_KEY from .env.local and restart the backend.

## What to Avoid

❌ **Don't** put the API key in frontend code
❌ **Don't** expose `GEMINI_API_KEY` in `vite.config.js`
❌ **Don't** commit `.env.local` to git (it's in `.gitignore`)
❌ **Don't** call Gemini on every page load (we're debouncing/deferring already)

## Monitoring Usage

Check your Gemini API usage at: https://aistudio.google.com/app/billing/overview

You'll see:
- Requests per minute/day
- Token usage trends
- Costs (should be $0 on free tier)

## Customizing Prompts

The system prompt is in `backend/src/services/GeminiService.ts`:

```typescript
const SYSTEM_PROMPT = `You are a helpful assistant for a campus lost and found platform...`
```

To change how Gemini behaves, edit this prompt. For example:
- Change tone to more casual/formal
- Add platform-specific rules
- Add instructions for specific use cases

## Production Deployment

When deploying to production:

1. **Set environment variable** on your hosting (Heroku, AWS, etc.):
   ```
   GEMINI_API_KEY=your_production_key
   GEMINI_MODEL=gemini-2.0-flash
   ```

2. **Enable rate limiting** (optional but recommended):
   - Use nginx/HAProxy to limit to 60 req/min per user
   - Or use middleware like express-rate-limit

3. **Monitor costs** at https://aistudio.google.com/app/billing

4. **Test thoroughly** before going live

## Troubleshooting

**Chatbot not showing up?**
```bash
# Check backend is running
curl http://localhost:3001/api/gemini/status

# Should return: {"available": true, "model": "gemini-2.0-flash"}
```

**"AI service not configured" error?**
1. Check GEMINI_API_KEY is set in `backend/.env.local`
2. Verify key is valid at https://aistudio.google.com
3. Restart backend: `npm run dev` in backend directory

**Search suggestions not appearing?**
- Check browser console (F12) for errors
- Check network tab to see if API calls are being made
- Try searching again (search is debounced by 400ms)

**Performance is slow?**
- Might be Gemini API latency (not your app)
- Check nearby network tab tab to see response times
- Can increase timeout in `.env.local` if needed

## Need Help?

1. Check the full guide: [GEMINI_INTEGRATION.md](./GEMINI_INTEGRATION.md)
2. Check Gemini documentation: https://ai.google.dev/
3. Check Google Cloud console for API errors: https://console.cloud.google.com/
4. Review backend logs: `npm run dev` output in terminal

---

**Enjoy your AI-powered campus lost & found! 🚀**
