# Railway Deployment Setup - STEP BY STEP

## ✅ Prerequisites Complete
- GitHub repository authorized ✓
- MongoDB Atlas cluster ready ✓
- Code pushed to GitHub ✓

---

## RAILWAY SETUP (Backend Deployment)

### Step 1: Start New Project
1. Open: **https://railway.app/dashboard**
2. Click **"New Project"** button (top right)
3. Select **"Deploy from GitHub Repo"**

### Step 2: Connect GitHub Repository
1. Search for: `Riphah-Clearance-Portal`
2. Click on the repository to select it
3. Railway will show the repo contents

### Step 3: Configure Backend Service
1. When prompted for root directory, enter: `backend/`
2. Framework should auto-detect as **Node.js**
3. Build command should be: `npm install`
4. Start command should be: `node server.js`

### Step 4: Add Environment Variables
**IMPORTANT:** Add these one by one in Railway dashboard:

```
PORT=5001
NODE_ENV=production
MONGO_URI=<YOUR_MONGODB_ATLAS_CONNECTION_STRING>
JWT_SECRET=<GENERATE_A_RANDOM_32_CHAR_STRING>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<YOUR_GMAIL>
EMAIL_PASSWORD=<YOUR_GMAIL_APP_PASSWORD>
CORS_ORIGIN=https://will-update-after-vercel
FRONTEND_URL=https://will-update-after-vercel
EMAIL_FROM=Faculty Clearance System <noreply@yourcompany.com>
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Watch build progress in Railway logs
3. Wait for ✅ deployment complete (usually 2-3 minutes)
4. Railway will assign you a URL like: `https://faculty-clearance-xxxxx.railway.app`
5. **SAVE THIS URL** - you need it for Vercel setup

### Step 6: Verify Backend is Running
Open in browser:
```
https://your-railway-url.railway.app/api/health
```
Should show connection details JSON

---

## VERCEL SETUP (Frontend Deployment)

### Step 1: Start New Project
1. Open: **https://vercel.com/dashboard**
2. Click **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**

### Step 2: Connect GitHub Repository
1. Search for: `Riphah-Clearance-Portal`
2. Click on the repository to select it
3. Vercel will show the repo contents

### Step 3: Configure Frontend Service
1. **Framework Preset**: Select **React** (should auto-detect)
2. **Root Directory**: Set to `frontend/`
3. **Build Command**: `npm run build`
4. **Output Directory**: `build`
5. **Install Command**: `npm install`

### Step 4: Add Environment Variable
Add only ONE variable:
```
REACT_APP_API_URL=<YOUR_RAILWAY_URL_FROM_STEP_ABOVE>
```

Example: `https://faculty-clearance-xxxxx.railway.app`

### Step 5: Deploy
1. Click **"Deploy"**
2. Watch build progress in Vercel logs
3. Wait for ✅ deployment complete (usually 1-2 minutes)
4. Vercel will assign you a URL like: `https://faculty-clearance-xxxx.vercel.app`
5. **SAVE THIS URL**

### Step 6: Update Railway CORS Settings
Now that you have the Vercel URL, go back to Railway:
1. Go to Railway Dashboard → Your Backend Project
2. Click **"Variables"** tab
3. Update these values:
   - `CORS_ORIGIN` = Your Vercel URL
   - `FRONTEND_URL` = Your Vercel URL
4. Railway auto-redeploys with new settings

### Step 7: Test End-to-End
1. Open your Vercel URL in browser
2. Try to log in
3. Open **DevTools → Network tab**
4. Verify API calls go to your Railway backend URL
5. Check **Console** for any errors

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| **Railway build fails** | Check backend/Dockerfile exists, check npm dependencies |
| **Vercel build fails** | Check frontend/package.json has all dependencies, check build command |
| **Can't connect to MongoDB** | Verify MONGO_URI in Railway matches MongoDB Atlas connection string |
| **Frontend shows blank page** | Check REACT_APP_API_URL in Vercel matches Railway URL |
| **Login doesn't work** | Check CORS_ORIGIN in Railway matches Vercel URL exactly |
| **Can't see logs** | Both platforms have log viewers - check Recent Deployments |

---

## QUICK REFERENCE

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Deployment Guide: RAILWAY_VERCEL_DEPLOYMENT_GUIDE.md
