# 🚀 AUTOMATED DEPLOYMENT - QUICK START

Your deployment is **fully automated**. Just follow these steps!

## ⚡ SUPER QUICK START (< 1 hour)

### 1️⃣ Install Required CLIs

```bash
# Install Railway CLI
npm install -g @railway/cli

# Install Vercel CLI
npm install -g vercel
```

### 2️⃣ Start Deployment

Choose your platform and run the script:

**Windows (PowerShell):**
```powershell
.\deploy-all.ps1
```

**Windows (Command Prompt):**
```cmd
deploy-all.bat
```

**Mac/Linux:**
```bash
bash deploy-all.sh
```

### 3️⃣ Follow the Prompts

The script will:
- ✅ Check your system
- ✅ Authenticate with Railway/Vercel
- ✅ Build your application
- ✅ Deploy to cloud platforms
- ✅ Provide you with URLs

---

## 🎯 DEPLOYMENT OPTIONS

When you run the script, you'll see 4 options:

### Option 1: Deploy Backend Only
```
Deploy to Railway (Backend Server)
```
- Takes: ~10 minutes
- Result: Get a Railway backend URL

### Option 2: Deploy Frontend Only
```
Deploy to Vercel (Frontend/React App)
```
- Takes: ~5 minutes
- Result: Get a Vercel frontend URL

### Option 3: Deploy Both
```
Deploy to Railway + Vercel
```
- Takes: ~15 minutes
- Result: Both URLs from above

### Option 4: Full Setup
```
Complete production deployment
```
- Guides you through the entire process
- Explains each step
- Prompts for final configuration

---

## 📋 WHAT YOU NEED BEFORE STARTING

### ✅ Services Created
- [ ] MongoDB Atlas cluster (get connection string)
- [ ] Railway account created
- [ ] Vercel account created
- [ ] GitHub repository (already done)

### ✅ CLIs Installed
- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Railway CLI (`npm install -g @railway/cli`)
- [ ] Vercel CLI (`npm install -g vercel`)

### ✅ Credentials Ready
- [ ] MongoDB Atlas connection string
- [ ] Gmail credentials (for email notifications)

---

## 🔧 MANUAL DEPLOYMENT (If Automation Fails)

Each script can be run individually:

### Deploy Backend Only
```powershell
# PowerShell
.\deploy-railway.ps1

# Bash (Mac/Linux)
bash deploy-railway.sh

# CMD (Windows)
deploy-railway.bat
```

### Deploy Frontend Only
```powershell
# PowerShell
.\deploy-vercel.ps1

# Bash (Mac/Linux)
bash deploy-vercel.sh

# CMD (Windows)
deploy-vercel.bat
```

---

## 🔑 ENVIRONMENT VARIABLES

After deployment, you need to configure these:

### Backend (Railway)
```
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_random_32_char_string
CORS_ORIGIN=https://your-vercel-url.vercel.app
FRONTEND_URL=https://your-vercel-url.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Faculty Clearance System <noreply@company.com>
```

**Where to set:**
1. Go to Railway Dashboard
2. Select your project
3. Go to "Variables" tab
4. Add each variable

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-railway-url.railway.app
```

**Where to set:**
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add the variable

---

## ⏱️ TIMING

| Step | Time |
|------|------|
| Backend Deployment | 10 min |
| Frontend Deployment | 5 min |
| Configure Variables | 5 min |
| Test Application | 5 min |
| **TOTAL** | **25 min** |

---

## ✅ VERIFICATION STEPS

After deployment, verify everything works:

### 1️⃣ Test Backend API
```bash
curl https://your-railway-url.railway.app/api/health

# Should respond: {"status":"ok","message":"Server is running"}
```

### 2️⃣ Test Frontend
- Open `https://your-vercel-url.vercel.app` in browser
- Should see login page

### 3️⃣ Test Login
- Enter faculty email and password
- Should redirect to dashboard

### 4️⃣ Test Clearance Submission
- Submit a clearance request
- Should show status page

---

## 🆘 TROUBLESHOOTING

### "CLI not found" Error
```bash
# Install the missing CLI
npm install -g @railway/cli
npm install -g vercel
```

### "Authentication failed"
```bash
# Login manually
railway login
vercel login
```

### "Cannot connect to API"
```
Check:
1. REACT_APP_API_URL is set in Vercel
2. CORS_ORIGIN is set in Railway
3. Backend is running (check Railway logs)
```

### "Build failed"
```bash
# Check for errors
cd frontend
npm run build
```

---

## 📊 POST-DEPLOYMENT

### Monitor Your Deployment

**Railway Dashboard:**
- View backend logs
- Check CPU/Memory usage
- Monitor deployments

**Vercel Dashboard:**
- View frontend analytics
- Check build logs
- Monitor performance

**MongoDB Atlas:**
- View database activity
- Check storage usage
- Monitor performance

---

## 🎯 DEPLOYMENT FLOW

```
1. Run deploy-all.ps1/sh/bat
         ↓
2. Choose deployment option
         ↓
3. Authenticate with services
         ↓
4. Set environment variables
         ↓
5. Build applications
         ↓
6. Deploy to cloud
         ↓
7. Get deployment URLs
         ↓
8. Update CORS variables
         ↓
9. ✅ LIVE IN PRODUCTION!
```

---

## 🔐 SECURITY NOTES

- ✅ Never commit .env files
- ✅ Use strong JWT_SECRET (32+ chars)
- ✅ Use app-specific Gmail passwords
- ✅ Keep MongoDB connection string secret
- ✅ Use HTTPS only (automatic)

---

## 📞 NEED HELP?

### Check Logs
```bash
# Railway logs
railway logs

# Vercel logs (in dashboard)
# MongoDB logs (in Atlas dashboard)
```

### Common Issues
See **DEPLOYMENT_INFRASTRUCTURE.md** troubleshooting section

### Documentation
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

---

## 🎉 SUCCESS!

When you see this:
```
✅ Backend deployed successfully!
✅ Frontend deployed successfully!
🎉 Deployment complete!
```

Your Faculty Clearance System is **LIVE IN PRODUCTION** 🚀

---

**Start deploying:**
```powershell
# Windows
.\deploy-all.ps1

# Mac/Linux
bash deploy-all.sh
```

