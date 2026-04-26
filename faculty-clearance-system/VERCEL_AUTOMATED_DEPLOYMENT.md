# Vercel Frontend Deployment - Complete Automated Setup

## Quick Summary
This document explains how to automatically deploy your frontend to Vercel whenever you push code to GitHub.

---

## Why Automatic Deployment?
- ✅ Every `git push` automatically deploys to Vercel
- ✅ No manual steps needed after first setup
- ✅ Get instant feedback on builds
- ✅ Easy to see deployment status

---

## How It Works

1. You push code to GitHub
2. GitHub Actions workflow triggers
3. Vercel CLI deploys your frontend
4. Your site updates automatically

---

## Setup Instructions

### Phase 1: Get Vercel Tokens (15 minutes)

Run this script:
```powershell
.\setup-vercel-step1.ps1
```

This will:
- Open Vercel dashboard in your browser
- Guide you to create a project
- Help you find your tokens

**You'll need to collect 3 values:**
1. **VERCEL_TOKEN** - Personal access token
2. **VERCEL_ORG_ID** - Your team/org ID  
3. **VERCEL_PROJECT_ID** - Your project ID

### Phase 2: Add Secrets to GitHub (5 minutes)

Run this script:
```powershell
.\add-vercel-secrets.ps1
```

Then paste your 3 tokens when prompted.

This will automatically add them to GitHub (or guide you to do it manually).

### Phase 3: Deploy (1 minute)

Push code to trigger deployment:
```powershell
git add .
git commit -m "Trigger Vercel deployment"
git push origin master
```

That's it! 

---

## Verify It Works

1. Go to: https://github.com/bilalkhan3266/Riphah-Clearance-Portal/actions
2. Look for **"Deploy Frontend to Vercel"** workflow
3. Watch it build and deploy
4. Check https://vercel.com/dashboard for your live URL

---

## Files Created

- `.github/workflows/vercel-deploy.yml` - Deployment automation
- `VERCEL_SETUP_GUIDE.md` - Detailed setup guide
- `setup-vercel-step1.ps1` - Get tokens script
- `add-vercel-secrets.ps1` - Add secrets script

---

## Troubleshooting

### "Workflow fails with Invalid token"
- Check the token has no extra spaces
- Verify it's not expired
- Create a new token if needed

### "Deployment says project not found"
- Verify VERCEL_PROJECT_ID matches your Vercel project
- Go to Vercel Settings > General to find correct ID

### "Build fails"
- Check frontend/package.json exists
- Ensure npm dependencies are correct
- Check build command: `npm run build`

### "Can't find deployment URL"
- Go to Vercel dashboard > Deployments tab
- Check GitHub Actions logs for error details

---

## Environment Variables for Frontend

After first deployment, add this to Vercel:

1. Vercel Dashboard > Your Project
2. Settings > Environment Variables
3. Add:
   - `REACT_APP_API_URL` = Your Railway backend URL
   
Example: `https://faculty-clearance-xxxxx.railway.app`

---

## Next Steps

1. Run: `.\setup-vercel-step1.ps1`
2. Get your 3 Vercel tokens
3. Run: `.\add-vercel-secrets.ps1`
4. Push code: `git push origin master`
5. Check deployment: https://github.com/bilalkhan3266/Riphah-Clearance-Portal/actions

---

## References

- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: https://github.com/bilalkhan3266/Riphah-Clearance-Portal/actions
- Deployment Workflow: `.github/workflows/vercel-deploy.yml`
