# 🌐 ENVIRONMENT VARIABLES - PRODUCTION SETUP

Complete reference for all environment variables needed for production deployment.

---

## 📋 BACKEND ENVIRONMENT VARIABLES

Set these in **Railway Dashboard** → Variables tab:

### Essential Variables

| Variable | Example | Description | Required |
|----------|---------|-------------|----------|
| `PORT` | `5001` | Server port (must be 5001 for Railway) | ✅ Yes |
| `NODE_ENV` | `production` | Environment mode | ✅ Yes |

### Database Configuration

| Variable | Example | Description | Required |
|----------|---------|-------------|----------|
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/faculty_clearance?retryWrites=true&w=majority` | MongoDB Atlas connection string | ✅ Yes |

**Get from MongoDB Atlas:**
1. Go to Clusters → Connect
2. Choose "Connect your application"
3. Copy connection string
4. Replace `PASSWORD` with actual password

### Security

| Variable | Example | Description | Required |
|----------|---------|-------------|----------|
| `JWT_SECRET` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` | Secret key for JWT tokens (32+ chars) | ✅ Yes |

**Generate random string:**
```powershell
# PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))

# Bash
openssl rand -base64 32
```

### CORS & Frontend

| Variable | Example | Description | Required |
|----------|---------|-------------|----------|
| `CORS_ORIGIN` | `https://your-app.vercel.app` | Your Vercel frontend URL (exact match!) | ✅ Yes |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Used in email links | ✅ Yes |

**Update after Vercel deployment:**
1. Get your Vercel URL from dashboard
2. Update both variables in Railway
3. Redeploy backend

### Email Configuration

| Variable | Example | Description | Required |
|----------|---------|-------------|----------|
| `EMAIL_HOST` | `smtp.gmail.com` | Gmail SMTP server | ✅ Yes |
| `EMAIL_PORT` | `587` | TLS port for Gmail | ✅ Yes |
| `EMAIL_USER` | `your-email@gmail.com` | Gmail address that sends emails | ✅ Yes |
| `EMAIL_PASSWORD` | `abcd efgh ijkl mnop` | Gmail app-specific password | ✅ Yes |
| `EMAIL_FROM` | `Faculty Clearance System <noreply@company.com>` | Display name in emails | ⭕ Optional |

**Get Gmail App Password:**
1. Go to Google Account: https://myaccount.google.com
2. Security → 2-Step Verification (enable if needed)
3. App passwords → Select "Mail" and "Windows Computer"
4. Generate password (16 characters with spaces)
5. Copy and paste into Railway

### Example Full Configuration

```
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://admin_user:MyP@ssw0rd@faculty-cluster.a1b2c3.mongodb.net/faculty_clearance?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
CORS_ORIGIN=https://faculty-clearance.vercel.app
FRONTEND_URL=https://faculty-clearance.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=bilalyousafxai326@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=Faculty Clearance System <noreply@riphah.edu.pk>
```

---

## 🎨 FRONTEND ENVIRONMENT VARIABLES

Set these in **Vercel Dashboard** → Settings → Environment Variables:

### Essential Variables

| Variable | Example | Description | Required |
|----------|---------|-------------|----------|
| `REACT_APP_API_URL` | `https://your-backend.railway.app` | Your Railway backend URL | ✅ Yes |

**Get from Railway:**
1. Go to Railway Dashboard
2. Select your backend project
3. Go to "Deployments" or "Domains"
4. Copy the URL (looks like `https://faculty-clearance-backend-prod-xxxxx.railway.app`)

### Optional Variables

| Variable | Example | Description | Required |
|----------|---------|-------------|----------|
| `REACT_APP_APP_NAME` | `Faculty Clearance System` | Display name in browser tab | ⭕ Optional |

### Example Configuration

```
REACT_APP_API_URL=https://faculty-clearance-backend-prod.railway.app
REACT_APP_APP_NAME=Faculty Clearance System
```

---

## 🔄 SETUP INSTRUCTIONS

### Step 1: Get Your URLs

After deploying to Railway and Vercel, you'll have:
- **Railway URL**: `https://xxxx.railway.app`
- **Vercel URL**: `https://yyyy.vercel.app`

### Step 2: Update Backend (Railway)

1. Go to https://railway.app/dashboard
2. Select your project
3. Click on the backend service
4. Go to "Variables" tab
5. Add/Update these:

```
CORS_ORIGIN=https://yyyy.vercel.app
FRONTEND_URL=https://yyyy.vercel.app
```

6. Go to "Deployments" tab
7. Click "Redeploy" on latest deployment

### Step 3: Update Frontend (Vercel)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add/Update:

```
REACT_APP_API_URL=https://xxxx.railway.app
```

5. Go to "Deployments" tab
6. Click "Redeploy" on latest deployment

---

## 🧪 VERIFY VARIABLES ARE SET

### Check Backend
```bash
# Connect to Railway
railway link

# View all variables
railway variables list

# Should show all the variables you set
```

### Check Frontend
1. Go to Vercel Dashboard
2. Project → Settings → Environment Variables
3. Verify `REACT_APP_API_URL` is set

---

## ⚠️ COMMON MISTAKES

❌ **DON'T:**
- Add `https://` twice (just once at start)
- Include trailing slash at end of URL
- Leave placeholder values like `<your-url>`
- Commit environment files to git
- Share your JWT_SECRET or MongoDB URI

✅ **DO:**
- Double-check URLs are exact (spaces matter!)
- Use fresh random string for JWT_SECRET
- Use app-specific password for Gmail (not main password)
- Update CORS_ORIGIN exactly as frontend URL appears
- Keep backups of your secrets

---

## 🔐 SECURITY CHECKLIST

Before going live, verify:

- [ ] `MONGO_URI` is not exposed in code
- [ ] `JWT_SECRET` is strong (32+ random chars)
- [ ] `EMAIL_PASSWORD` is app-specific (not main password)
- [ ] `CORS_ORIGIN` matches your exact Vercel domain
- [ ] No sensitive data in `.env` files (should be in Railway/Vercel)
- [ ] `.gitignore` prevents .env files from git
- [ ] All URLs use HTTPS
- [ ] MongoDB IP whitelist configured

---

## 📝 VARIABLE TEMPLATE

Copy and customize these:

### For Railway (Backend)
```
PORT=5001
NODE_ENV=production
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/faculty_clearance?retryWrites=true&w=majority
JWT_SECRET=GENERATE_RANDOM_32_CHARACTER_STRING_HERE
CORS_ORIGIN=https://YOUR_VERCEL_URL.vercel.app
FRONTEND_URL=https://YOUR_VERCEL_URL.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_GMAIL@gmail.com
EMAIL_PASSWORD=YOUR_APP_PASSWORD
EMAIL_FROM=Faculty Clearance System <noreply@yourcompany.com>
```

### For Vercel (Frontend)
```
REACT_APP_API_URL=https://YOUR_RAILWAY_URL.railway.app
REACT_APP_APP_NAME=Faculty Clearance System
```

---

## 🎯 DEPLOYMENT CHECKLIST

- [ ] MongoDB Atlas cluster created with connection string
- [ ] Railway account has backend deployed
- [ ] Vercel account has frontend deployed
- [ ] All backend environment variables set in Railway
- [ ] All frontend environment variables set in Vercel
- [ ] Both services redeployed after variable updates
- [ ] CORS_ORIGIN is exact match with Vercel URL
- [ ] REACT_APP_API_URL is exact match with Railway URL
- [ ] Tested backend API: `curl https://xxxx.railway.app/api/health`
- [ ] Tested frontend loading at Vercel URL
- [ ] Tested login functionality
- [ ] Tested clearance submission

---

## 🆘 TROUBLESHOOTING

### "CORS Error" in Frontend Console
**Solution:**
1. Check `CORS_ORIGIN` in Railway exactly matches Vercel URL
2. Wait 2 minutes after updating variables
3. Redeploy backend and frontend

### "Cannot connect to MongoDB"
**Solution:**
1. Verify `MONGO_URI` is correct
2. Check MongoDB cluster is running
3. Whitelist Railway IP in MongoDB Atlas Network Access

### "API returns 401 Unauthorized"
**Solution:**
1. Check `JWT_SECRET` is set in Railway
2. Make sure it matches on both sides
3. Redeploy backend

### "Emails not sending"
**Solution:**
1. Verify Gmail credentials are correct
2. Check email is app-specific password (not main)
3. Verify Gmail account has SMTP enabled
4. Check Railway logs for email errors

---

## 📞 GETTING HELP

If variables seem wrong:
1. Check Railway Dashboard → Logs
2. Check Vercel Dashboard → Deployments → Logs
3. Check browser console (F12) for errors
4. Verify URLs one character at a time

---

**Ready?** → Go to **AUTOMATED_DEPLOYMENT_GUIDE.md** and run the deployment script!

