# 🚀 FACULTY CLEARANCE SYSTEM - DEPLOYMENT GUIDE

## Overview
This guide covers deploying the Faculty Clearance System to:
- **Frontend**: Vercel (React App)
- **Backend**: Railway (Node.js/Express)
- **Database**: MongoDB Atlas (Cloud)

---

## 📋 PREREQUISITES

Before starting, ensure you have:
1. ✅ GitHub account (for git repository)
2. ✅ Vercel account (free tier available)
3. ✅ Railway account (free tier available)
4. ✅ MongoDB Atlas account (free tier available)
5. ✅ Git installed on your machine
6. ✅ Node.js v14+ installed

### Quick Sign-ups:
- **Vercel**: https://vercel.com (sign up with GitHub)
- **Railway**: https://railway.app (sign up with GitHub)
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas (sign up with email)

---

## 🔧 STEP 1: SETUP MONGODB ATLAS

### 1.1 Create a Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign in or create account
3. Click "Create Deployment"
4. Choose **Free** tier
5. Select your region (choose closest to you)
6. Name it: `faculty-clearance-prod`
7. Click "Create Deployment" - wait 5-10 minutes for cluster to be ready

### 1.2 Create Database User
1. Go to "Database Access" in sidebar
2. Click "Add New Database User"
3. **Username**: `admin_user` (or your choice)
4. **Password**: Generate secure password (save it!)
5. Built-in Role: `Atlas admin`
6. Click "Add User"

### 1.3 Get Connection String
1. Go to "Database" → "Clusters"
2. Click "Connect" button on your cluster
3. Select "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://admin_user:PASSWORD@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `PASSWORD` with your actual password
6. Replace database name if needed (keep `faculty_clearance`)
7. **Save this string** - you'll need it for Railway

---

## 🚂 STEP 2: DEPLOY BACKEND ON RAILWAY

### 2.1 Push Code to GitHub
```bash
# Navigate to project root
cd g:\FYP2\faculty-clearance-system

# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Faculty Clearance System"

# Create repository on GitHub:
# 1. Go to https://github.com/new
# 2. Name: `Riphah-Clearance-Portal` (or your choice)
# 3. Make it PUBLIC
# 4. Don't initialize with anything
# 5. Click "Create repository"

# Then push your code:
git remote add origin https://github.com/YOUR_USERNAME/Riphah-Clearance-Portal.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy on Railway
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Search and select your repository
6. Select the backend folder: `faculty-clearance-system/backend`
7. Click "Add Variables"
8. Add these environment variables:

| Variable | Value |
|----------|-------|
| `PORT` | `5001` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate a random 32+ char string |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASSWORD` | Your Gmail app password |
| `CORS_ORIGIN` | Leave empty for now (update after Vercel deployment) |
| `FRONTEND_URL` | Leave empty for now (update after Vercel deployment) |

9. Click "Deploy"
10. Wait for deployment to complete (5-10 minutes)
11. Your backend URL will be like: `https://faculty-clearance-backend-prod-xxxxx.railway.app`

---

## 🌐 STEP 3: DEPLOY FRONTEND ON VERCEL

### 3.1 Update Backend URL
Before deploying frontend, you need your Railway backend URL from Step 2.

1. Go to Railway dashboard
2. Click on your deployed project
3. Note the URL from "Domains" section (looks like `https://faculty-clearance-backend-prod-xxxxx.railway.app`)

### 3.2 Deploy on Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: React
   - **Root Directory**: `faculty-clearance-system/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

6. Add Environment Variable:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your Railway backend URL (e.g., `https://your-backend.railway.app`)

7. Click "Deploy"
8. Wait for deployment (3-5 minutes)
9. Your frontend URL will be like: `https://faculty-clearance-system.vercel.app`

### 3.3 Update Backend CORS Settings
Now that you have your frontend URL, update Railway:
1. Go back to Railway project dashboard
2. Click on your backend service
3. Go to "Variables"
4. Update/add:
   - `CORS_ORIGIN` = Your Vercel frontend URL
   - `FRONTEND_URL` = Your Vercel frontend URL

5. Redeploy by pushing a small change or manually triggering deployment

---

## ✅ STEP 4: VERIFY DEPLOYMENT

### Test Backend
```bash
# Replace with your Railway URL
curl https://your-backend.railway.app/api/health

# Expected response:
# {"status":"healthy"} or similar
```

### Test Frontend
1. Open your Vercel URL in browser
2. Try logging in with test credentials
3. Check if data loads properly
4. Test clearance functions

### Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `CORS_ORIGIN` in Railway variables matches your Vercel URL exactly |
| MongoDB connection fails | Verify `MONGO_URI` is correct in Railway variables, whitelist Railway IP |
| Frontend shows "Cannot connect to API" | Check `REACT_APP_API_URL` matches Railway domain |
| Deploy keeps failing | Check Railway logs: Dashboard → Project → Logs tab |

---

## 🔄 STEP 5: CONTINUOUS DEPLOYMENT

Both Vercel and Railway automatically redeploy when you push to main branch.

To deploy updates:
```bash
# Make your changes locally
git add .
git commit -m "Update: description"
git push origin main

# Vercel and Railway will automatically rebuild and deploy
```

---

## 🛡️ SECURITY CHECKLIST

Before going live, verify:

- [ ] `JWT_SECRET` is a strong, random 32+ character string
- [ ] Email credentials are app-specific passwords (not main password)
- [ ] `MONGO_URI` connection string is not exposed in code
- [ ] `CORS_ORIGIN` is set to your exact Vercel domain
- [ ] MongoDB Atlas has IP whitelist (or accept all for testing)
- [ ] Database backups are enabled in MongoDB Atlas
- [ ] No sensitive data in `.env` files

---

## 📞 SUPPORT & NEXT STEPS

### If Deployment Fails:
1. Check Railway/Vercel logs
2. Verify all environment variables
3. Ensure MongoDB Atlas is running
4. Check GitHub repository is public/accessible

### Production Recommendations:
- [ ] Set up custom domains
- [ ] Enable SSL certificates (automatic on Vercel/Railway)
- [ ] Configure email notifications
- [ ] Set up database backups
- [ ] Monitor application performance
- [ ] Set up error tracking (Sentry, etc.)

---

## 📚 USEFUL LINKS

- Railway Documentation: https://docs.railway.app
- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Express.js Guide: https://expressjs.com
- React Documentation: https://react.dev

---

**Deployment Status**: ✅ Ready to Deploy
**Last Updated**: April 2026
