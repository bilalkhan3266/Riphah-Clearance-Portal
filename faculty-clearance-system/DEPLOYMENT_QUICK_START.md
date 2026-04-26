# 🚀 QUICK DEPLOYMENT CHECKLIST

## Pre-Deployment Checklist (Do This Now)

### MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
- [ ] Create free cluster (choose nearest region)
- [ ] Create database user (save username & password)
- [ ] Get connection string (save with password replaced)
- [ ] Whitelist IP address (0.0.0.0/0 for development, or add specific IPs later)

### GitHub Setup
- [ ] Push project to GitHub
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/YOUR_USERNAME/Riphah-Clearance-Portal.git
  git branch -M main
  git push -u origin main
  ```

### Accounts & Services
- [ ] GitHub account: https://github.com
- [ ] Railway account: https://railway.app (sign up with GitHub)
- [ ] Vercel account: https://vercel.com (sign up with GitHub)
- [ ] Gmail account with app password (for email notifications)

---

## Railway Backend Deployment

### 1. Connect GitHub Repository
- Go to Railway.app → New Project
- Select "Deploy from GitHub repo"
- Choose your repository
- Select root directory: `faculty-clearance-system/backend`

### 2. Set Environment Variables
Copy these into Railway dashboard:

```
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.abc123.mongodb.net/faculty_clearance?retryWrites=true&w=majority
JWT_SECRET=your_random_32_character_string_here_min32chars
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
CORS_ORIGIN=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_FROM=Faculty Clearance System <noreply@company.com>
```

### 3. Deploy
- Click "Deploy"
- Wait 5-10 minutes
- Get your Railway URL: `https://your-backend.railway.app`

---

## Vercel Frontend Deployment

### 1. Import Repository
- Go to Vercel.com → Add New Project
- Import your GitHub repository
- Root Directory: `faculty-clearance-system/frontend`

### 2. Environment Variables
```
REACT_APP_API_URL=https://your-backend.railway.app
REACT_APP_APP_NAME=Faculty Clearance System
```

### 3. Deploy
- Click "Deploy"
- Wait 3-5 minutes
- Get your Vercel URL: `https://your-app.vercel.app`

---

## Post-Deployment Configuration

### Update Railway CORS (after Vercel deployment)
1. Go to Railway → Your Project → Backend Service
2. Update Variables:
   - `CORS_ORIGIN` = Your Vercel URL
   - `FRONTEND_URL` = Your Vercel URL
3. Redeploy by going to "Deployments" and selecting latest

### Test the Deployment
```bash
# Test backend
curl https://your-backend.railway.app/api/health

# Test frontend - open in browser
https://your-frontend.vercel.app
```

---

## Environment Variables Reference

### Backend (.env.production)
| Variable | Example Value | Notes |
|----------|---------------|-------|
| PORT | 5001 | Must be 5001 |
| NODE_ENV | production | Critical for security |
| MONGO_URI | mongodb+srv://... | MongoDB Atlas connection string |
| JWT_SECRET | random_32_char_string | Use `openssl rand -base64 32` |
| CORS_ORIGIN | https://app.vercel.app | Your Vercel frontend URL |
| FRONTEND_URL | https://app.vercel.app | Used in email links |
| EMAIL_HOST | smtp.gmail.com | For email notifications |
| EMAIL_USER | your-email@gmail.com | Gmail that sends emails |
| EMAIL_PASSWORD | app_specific_password | Not your main password! |

### Frontend (.env.production)
| Variable | Example Value |
|----------|---------------|
| REACT_APP_API_URL | https://backend.railway.app |
| REACT_APP_APP_NAME | Faculty Clearance System |

---

## Generate Secure JWT Secret

### On Windows (PowerShell):
```powershell
$bytes = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
$buffer = New-Object Byte[] 32
$bytes.GetBytes($buffer)
[Convert]::ToBase64String($buffer)
```

### On Mac/Linux:
```bash
openssl rand -base64 32
```

---

## MongoDB Atlas Setup Details

### Create Atlas User
1. Database Access → Add New Database User
2. Authentication Method: "Password"
3. Username: `admin_user`
4. Generate Secure Password (save it!)
5. Database User Privileges: "Atlas admin"

### Get Connection String
1. Clusters → Connect → Connect your application
2. Driver: Node.js, Version: 4.4 or later
3. Copy connection string:
   ```
   mongodb+srv://admin_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace PASSWORD with your password
5. Use in `MONGO_URI`

---

## Troubleshooting

### "CORS Error" in Frontend
**Solution**: 
- Verify `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Wait 2 minutes after updating Railway variables
- Hard refresh frontend (Ctrl+Shift+R)

### "Cannot connect to database"
**Solution**:
- Check MongoDB Atlas is running
- Verify `MONGO_URI` in Railway is correct
- Whitelist Railway IP in MongoDB Atlas Network Access

### "Page not found" on Vercel
**Solution**:
- Check `vercel.json` exists in frontend folder
- Verify build command is `npm run build`
- Check output directory is `build`

### Backend deployment keeps failing
**Solution**:
- Check Railway logs: Dashboard → Logs
- Verify `package.json` exists in backend folder
- Ensure `server.js` is in backend root

---

## Security Reminders

⚠️ **CRITICAL**:
- [ ] Never commit `.env` files to GitHub
- [ ] Use strong JWT_SECRET (32+ random chars)
- [ ] Don't share MongoDB connection strings
- [ ] Use app-specific passwords for Gmail (not main password)
- [ ] Keep production secrets secure

---

## Next Steps After Deployment

1. **Test All Features**:
   - Login with test user
   - Submit clearance request
   - Check clearance status
   - Send messages to departments

2. **Setup Monitoring**:
   - Railway: Built-in logs
   - Vercel: Built-in analytics
   - MongoDB Atlas: Performance Advisor

3. **Custom Domain** (Optional):
   - Railway: Domains tab
   - Vercel: Settings → Domains

4. **SSL/HTTPS**:
   - Railway: Automatic
   - Vercel: Automatic
   - MongoDB Atlas: Automatic

---

## Deployment Status

```
✅ Backend Configuration Files: READY
✅ Frontend Configuration Files: READY
✅ Environment Variables: TEMPLATE PROVIDED
⏳ MongoDB Atlas: AWAITING USER SETUP
⏳ GitHub Repository: AWAITING USER PUSH
⏳ Railway Deployment: AWAITING USER ACTION
⏳ Vercel Deployment: AWAITING USER ACTION
```

---

**Last Updated**: April 2026
**Estimated Deployment Time**: 30-45 minutes
**Support**: Check respective docs if issues arise
