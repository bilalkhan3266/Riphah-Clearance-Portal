# 🚀 QUICK START - FIX 401 LOGIN ERROR

## The Issue You're Seeing

```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

**What this means**: Your login credentials are wrong or the user doesn't exist.

---

## ✅ Correct Credentials to Use

Use **ONE** of these:

```
Email:    faculty1@test.edu
Password: Test@123
```

OR

```
Email:    lab@test.edu
Password: Test@123
```

---

## 🧪 Quick Test (Choose One)

### Option 1: Test with Terminal (Fastest)
```bash
cd backend
node test-login-endpoint.js
```

This will test the credentials for you automatically!

### Option 2: Test with cURL
```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty1@test.edu","password":"Test@123"}'
```

### Option 3: Test from Frontend
1. Open `http://localhost:3000` in browser
2. Click **Login**
3. Enter credentials above
4. Click **Submit**

---

## 📊 Expected Result

### ✅ Success (Status 200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "email": "faculty1@test.edu",
    "full_name": "Dr. Ahmed Hassan",
    "role": "faculty"
  }
}
```

### ❌ Failure (Status 401):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 🔧 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| **401 Always** | Wrong email/password | Use: `faculty1@test.edu` / `Test@123` |
| **Connection refused** | Backend not running | Run: `npm run dev` in backend folder |
| **404 Not Found** | Wrong URL endpoint | Use: `http://localhost:5001/api/login` |
| **Still 401** | Check backend logs | Look for: ❌ User not found |

---

## 📝 Step-by-Step Fix

### Terminal 1: Start Backend
```bash
cd faculty-clearance-system/backend
npm run dev
# Wait for: ✅ Server running on port 5001
```

### Terminal 2: Test Login
```bash
cd faculty-clearance-system/backend
node test-login-endpoint.js
```

### Terminal 3 (Optional): Monitor Logs
Keep terminal 1 visible to see login logs like:
```
🔐 [POST /login] Request received
   Email: faculty1@test.edu
   ✅ User found: Dr. Ahmed Hassan
   ✅ Password matched
   ✅ Token generated
```

---

## 🎯 What Happens After Successful Login

1. **Frontend receives token** → Stores in localStorage
2. **Token used for all requests** → Included in Authorization header
3. **Faculty can submit clearance** → System checks issues automatically
4. **Status shown instantly** → "Blocked" or "Approved"

---

## 📄 Full Docs

For complete information about the 401 error and all debugging steps, see:
- [LOGIN_401_ERROR_FIX.md](LOGIN_401_ERROR_FIX.md) - Detailed troubleshooting guide
- [QUICKSTART.md](QUICKSTART.md) - Complete system setup

---

## ✨ TL;DR

1. Use email: `faculty1@test.edu`
2. Use password: `Test@123`
3. Run: `npm run dev` in backend
4. Reload browser page
5. Try login again
6. It should work! ✅

**If it doesn't work**: Run `node test-login-endpoint.js` to see specific error

---

**Status**: Ready to debug! 🚀
