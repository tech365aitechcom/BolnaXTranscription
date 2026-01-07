# 🚀 Deployment Guide for Bolna Transcription Viewer

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

#### Step 1: Create a Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub, GitLab, or Email
3. Verify your email

#### Step 2: Deploy via Vercel Dashboard

**Method A: Using Git (Recommended)**
1. Create a GitHub repository for your project
2. Push your code to GitHub:
   ```bash
   cd transcription-viewer
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/bolna-transcription-viewer.git
   git push -u origin main
   ```
3. Go to https://vercel.com/new
4. Import your GitHub repository
5. Click "Deploy"
6. Wait for deployment to complete

**Method B: Using Vercel CLI**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Login to Vercel:
   ```bash
   vercel login
   ```
3. Deploy:
   ```bash
   cd transcription-viewer
   vercel
   ```
4. Follow the prompts (accept defaults)
5. For production deployment:
   ```bash
   vercel --prod
   ```

#### Step 3: Get Your Deployment URL
After deployment, you'll get a URL like:
```
https://bolna-transcription-viewer.vercel.app
```

---

## 📌 Webhook URL for Bolna.ai

Once deployed, use this URL in your Bolna agent settings:

### Your Webhook Endpoint:
```
https://YOUR-APP-NAME.vercel.app/api/webhook
```

### Example:
If your Vercel URL is `https://bolna-transcription-viewer.vercel.app`, then:
```
https://bolna-transcription-viewer.vercel.app/api/webhook
```

---

## 🔧 Configuring Bolna.ai

### Step 1: Go to Your Bolna Agent Settings
1. Login to https://platform.bolna.ai/dashboard
2. Navigate to your agent (e.g., "Ear Solutions")
3. Click on the "Agent" tab

### Step 2: Add Webhook URL
1. Scroll down to **"Push all execution data to webhook"**
2. Click **"See all events"** (if needed)
3. In the webhook URL field, paste:
   ```
   https://YOUR-APP-NAME.vercel.app/api/webhook
   ```
4. Click **"Save agent"**

### Step 3: Test the Integration
1. Make a test call using Bolna's "Book a call" or "Test via web call" feature
2. After the call ends, check your deployed app
3. The transcript should appear automatically!

---

## 📱 Accessing Your App

### View Transcripts:
```
https://YOUR-APP-NAME.vercel.app
```

The app will:
- ✅ Show the latest conversation transcript
- ✅ Update in real-time when new calls complete
- ✅ Display beautiful chat-style UI
- ✅ Show conversation stats (message count, user/assistant split)

---

## 🔍 Verifying the Setup

### 1. Check Webhook Endpoint
Visit: `https://YOUR-APP-NAME.vercel.app/api/webhook`

You should see:
```json
{
  "message": "Webhook endpoint is active",
  "endpoint": "/api/webhook",
  "method": "POST"
}
```

### 2. Check All Conversations API
Visit: `https://YOUR-APP-NAME.vercel.app/api/conversations`

You should see:
```json
{
  "success": true,
  "count": 0,
  "conversations": []
}
```

### 3. Make a Test Call
1. Use Bolna's "Test via web call" feature
2. Complete a short conversation
3. Wait for the call to end
4. Refresh your app - the transcript should appear!

---

## 🎯 Quick Reference

| Item | URL/Value |
|------|-----------|
| **Main App** | `https://YOUR-APP-NAME.vercel.app` |
| **Webhook Endpoint** | `https://YOUR-APP-NAME.vercel.app/api/webhook` |
| **Conversations API** | `https://YOUR-APP-NAME.vercel.app/api/conversations` |
| **Live Updates** | `https://YOUR-APP-NAME.vercel.app/api/events` |

---

## 🔐 Security Considerations

For production use, consider adding:

### 1. API Key Authentication
Add to `app/api/webhook/route.ts`:
```typescript
const apiKey = request.headers.get('x-api-key');
if (apiKey !== process.env.WEBHOOK_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 2. IP Whitelist
Bolna webhooks come from specific IPs (see their docs):
```
13.200.45.41
65.2.44.157
34.194.233.253
13.204.98.4
43.205.31.43
107.20.118.52
```

---

## 📊 Monitoring

### Vercel Dashboard
- View logs: https://vercel.com/dashboard
- See deployments
- Monitor performance
- Check errors

### Browser Console
- Open DevTools (F12)
- Check Console for errors
- Monitor Network tab for API calls

---

## 🆘 Troubleshooting

### Issue: Webhook not receiving data
**Solution:**
1. Verify webhook URL is correct in Bolna
2. Check Vercel logs for errors
3. Test endpoint manually with curl:
   ```bash
   curl -X POST https://YOUR-APP-NAME.vercel.app/api/webhook \
     -H "Content-Type: application/json" \
     -d @example.json
   ```

### Issue: Transcript not showing
**Solution:**
1. Check browser console for errors
2. Verify SSE connection is active
3. Check conversation data in API:
   ```
   https://YOUR-APP-NAME.vercel.app/api/conversations
   ```

### Issue: App shows "Loading transcript..."
**Solution:**
- No conversations received yet
- Make a test call via Bolna
- Wait for call to complete
- Refresh the page

---

## 🔄 Updating Your App

### Option 1: Via Git (if using GitHub)
```bash
git add .
git commit -m "Update app"
git push
```
Vercel will auto-deploy!

### Option 2: Via Vercel CLI
```bash
vercel --prod
```

---

## 📝 Environment Variables (Optional)

If you need environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables:
   - `WEBHOOK_API_KEY` - For authentication
   - `DATABASE_URL` - If using database

3. Redeploy:
   ```bash
   vercel --prod
   ```

---

## ✅ Final Checklist

Before going live:

- [ ] App deployed to Vercel
- [ ] Deployment URL obtained
- [ ] Webhook URL added to Bolna agent
- [ ] Test call completed successfully
- [ ] Transcript appears in UI
- [ ] Real-time updates working
- [ ] All endpoints tested

---

## 🎉 You're Done!

Your Bolna transcription viewer is now live and ready to receive real-time conversation data!

**Need help?** Check the documentation or contact support.
