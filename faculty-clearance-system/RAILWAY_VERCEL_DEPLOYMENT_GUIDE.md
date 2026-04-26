# Faculty Clearance System - Railway & Vercel Deployment Guide

## Overview
This guide explains how to deploy the Faculty Clearance System to Railway (backend) and Vercel (frontend).

---

## Prerequisites
- ✅ Code pushed to GitHub: `bilalkhan3266/Riphah-Clearance-Portal`
- ✅ Railway account created (https://railway.app)
- ✅ Vercel account created (https://vercel.com)
- ✅ MongoDB Atlas account (https://mongodb.com/cloud/atlas) with a cluster created
- ✅ Gmail App Password for email notifications (if using Gmail)

---

## Step 1: Set Up MongoDB Atlas

1. **Go to MongoDB Atlas**: https://mongodb.com/cloud/atlas
2. **Create/Access your cluster**
3. **Get your connection string**:
   - Click "Connect" → "Drivers" → Copy the connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
4. **Create a database user** (if not already done):
   - Username: Something like `faculty_admin`
   - Password: Strong password (save this!)

---

## Step 2: Deploy Backend to Railway

### 2.1 Connect Railway to GitHub
1. Go to **https://railway.app**
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Search for `Riphah-Clearance-Portal` and select it
4. Railway will auto-detect the Node.js backend
5. Select the `backend/` directory as the root

### 2.2 Configure Environment Variables in Railway
1. After selecting the repo, Railway shows an environment variable section
2. Add these variables (copy from `backend/.env.production`):

```
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://faculty_admin:YOUR_PASSWORD@your-cluster.mongodb.net/faculty_clearance?retryWrites=true&w=majority
JWT_SECRET=your_long_random_string_at_least_32_characters_change_this
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_FROM=Faculty Clearance System <noreply@yourcompany.com>
```

**⚠️ IMPORTANT VALUES TO REPLACE:**
- `YOUR_PASSWORD` - Your MongoDB Atlas password
- `your-cluster` - Your MongoDB Atlas cluster name
- `your_long_random_string...` - Generate a strong JWT secret (min 32 chars)
- `your_email@gmail.com` - Your Gmail address
- `your_gmail_app_password` - Gmail App Password (NOT your regular password)
- `your-frontend.vercel.app` - Will get this from Vercel deployment

### 2.3 Deploy
1. Click **"Deploy"** - Railway will build and deploy automatically
2. Wait for build to complete (usually 2-3 minutes)
3. Once deployed, you'll see a URL like: `https://faculty-clearance-prod-abc123.railway.app`
4. **Save this URL** - you need it for the frontend!

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect Vercel to GitHub
1. Go to **https://vercel.com**
2. Click **"Add New"** → **"Project"** → **"Import Git Repository"**
3. Search for `Riphah-Clearance-Portal` and select it
4. Vercel will auto-detect as React project

### 3.2 Configure Build Settings
1. **Framework Preset**: React (auto-selected)
2. **Root Directory**: Set to `frontend/`
3. **Build Command**: `npm run build` (should be auto-filled)
4. **Install Command**: `npm install` (should be auto-filled)

### 3.3 Configure Environment Variables
Add this variable:
```
REACT_APP_API_URL=https://your-railway-backend-url.railway.app
```

Replace `your-railway-backend-url` with the URL you got from Step 2.3

### 3.4 Deploy
1. Click **"Deploy"**
2. Wait for build to complete (usually 1-2 minutes)
3. Once deployed, you'll get a Vercel URL: `https://faculty-clearance-prod.vercel.app`
4. **Save this URL**

---

## Step 4: Update Railway with Vercel Frontend URL

Now that you have the Vercel URL, update Railway with the correct frontend URL:

1. Go back to **Railway Dashboard**
2. Select your backend project
3. Go to **Variables**
4. Update:
   - `CORS_ORIGIN` = Your Vercel URL
   - `FRONTEND_URL` = Your Vercel URL
5. Railway will auto-redeploy

---

## Step 5: Verify Deployments

### Test the Backend
```bash
# Health check endpoint
curl https://your-railway-backend-url.railway.app/api/health

# Should respond with connection details
```

### Test the Frontend
1. Open your Vercel URL in a browser
2. Try logging in with test credentials
3. Check that API calls reach the backend (check Network tab in DevTools)

---

## Troubleshooting

### Backend not connecting to MongoDB
- Check MongoDB Atlas firewall: Allow all IPs (0.0.0.0/0) for development
- Verify MONGO_URI is correct in Railway environment variables
- Check MongoDB Atlas user credentials

### Frontend can't reach backend API
- Ensure `REACT_APP_API_URL` is set correctly in Vercel
- Check Railway has correct `CORS_ORIGIN` set to Vercel URL
- Check browser console for CORS errors

### Build fails on Vercel
- Ensure build command is `npm run build`
- Check that all dependencies are in `package.json`
- Check `frontend/` package.json has `react-scripts` as dependency

### Build fails on Railway
- Check backend Dockerfile is correct
- Ensure all dependencies are in `backend/package.json`
- Check `.env.production` variables are valid

---

## Production Checklist

- [ ] MongoDB Atlas cluster created and user configured
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Railway backend URL added to Vercel environment variables
- [ ] Vercel frontend URL added to Railway environment variables
- [ ] CORS_ORIGIN in Railway matches Vercel URL
- [ ] JWT_SECRET changed to strong random string
- [ ] Email configuration set up (if needed)
- [ ] Test login works end-to-end
- [ ] Check logs for any errors

---

## File References
- Backend config: `backend/railway.json`
- Backend env: `backend/.env.production`
- Frontend config: `frontend/vercel.json`
- Frontend env: `frontend/.env.production`

---

## Support
For issues, check:
- Railway dashboard logs
- Vercel deployment logs
- MongoDB Atlas logs
- Browser console/Network tab for API errors
