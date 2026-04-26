# Vercel Deployment Automation - Setup Guide

## Overview
This guide will set up automatic Vercel deployment using GitHub Actions. Every time you push to GitHub, your frontend will automatically deploy to Vercel.

---

## Step 1: Create Vercel Project

### Option A: Create Project on Vercel (Recommended)
1. Go to: https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Search for and select: `Riphah-Clearance-Portal`
5. Configure:
   - **Framework**: React
   - **Root Directory**: `frontend/`
   - **Build Command**: `npm run build`
   - **Environment Variables**: 
     - `REACT_APP_API_URL` = (leave for now, will set via GitHub Actions)
6. Click **"Deploy"** (this creates the initial project)
7. After deployment completes, go to **Settings** → **General** to find your Project ID

### Option B: Link Existing Vercel Project
If you already have a Vercel project:
1. Skip to Step 2

---

## Step 2: Get Your Vercel Tokens

### Get VERCEL_TOKEN
1. Go to: https://vercel.com/account/tokens
2. Click **"Create New Token"**
3. **Token Name**: `GitHub Actions`
4. **Scope**: Select "Full Account"
5. **Expiration**: Never (or set to 1 year)
6. Click **"Create"**
7. **COPY THE TOKEN** (you'll only see it once!)
8. Save it temporarily - you'll add it to GitHub next

### Get VERCEL_ORG_ID
1. Go to: https://vercel.com/account/general
2. Find **"Team ID"** on this page
3. Copy it (it's usually a long alphanumeric string)

### Get VERCEL_PROJECT_ID
1. Go to: https://vercel.com/dashboard
2. Click on your `Riphah-Clearance-Portal` project
3. Go to **Settings** → **General**
4. Find **"Project ID"** 
5. Copy it

---

## Step 3: Add GitHub Secrets

1. Go to: https://github.com/bilalkhan3266/Riphah-Clearance-Portal
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **"New repository secret"** and add these 3 secrets:

| Secret Name | Value |
|------------|-------|
| `VERCEL_TOKEN` | Your token from Step 2 |
| `VERCEL_ORG_ID` | Your org/team ID from Step 2 |
| `VERCEL_PROJECT_ID` | Your project ID from Step 2 |

---

## Step 4: Enable Automatic Deployment

Once the secrets are added and this workflow file is pushed to GitHub:

### Trigger Deployment
Push any changes to the `frontend/` folder:
```powershell
git add frontend/
git commit -m "Update frontend"
git push origin master
```

OR manually trigger via GitHub:
1. Go to: https://github.com/bilalkhan3266/Riphah-Clearance-Portal/actions
2. Find **"Deploy Frontend to Vercel"** workflow
3. Click it → Click **"Run workflow"** → **"Run workflow"**

### Monitor Deployment
1. GitHub Actions will show build progress
2. Check Vercel dashboard: https://vercel.com/dashboard
3. Your deployment URL will appear when complete

---

## Environment Variables for Vercel

After first deployment, add this to Vercel:

1. Go to Vercel Dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Your Railway backend URL (e.g., `https://faculty-clearance-xxxxx.railway.app`)
   - **Environments**: Production, Preview, Development

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Workflow fails with "Invalid token" | Check VERCEL_TOKEN secret is correct (no extra spaces) |
| Workflow fails with "Project not found" | Check VERCEL_PROJECT_ID matches your Vercel project |
| Build fails on Vercel | Check frontend/package.json has all dependencies |
| API calls fail after deploy | Check REACT_APP_API_URL environment variable is set |
| Can't find deployment URL | Check Vercel dashboard under "Deployments" tab |

---

## Files Created
- `.github/workflows/vercel-deploy.yml` - Automatic deployment workflow

---

## References
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: https://github.com/bilalkhan3266/Riphah-Clearance-Portal/actions
- Vercel Docs: https://vercel.com/docs
