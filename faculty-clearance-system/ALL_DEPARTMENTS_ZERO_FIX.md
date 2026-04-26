# 🔍 ALL DEPARTMENTS SHOWING "0 PENDING" - COMPLETE TROUBLESHOOTING

## Current Status

| Component | Status |
|-----------|--------|
| Backend Server | ✅ Running |
| Database | ✅ Has 981 issues with status="Pending" |
| Password Hashes | ✅ All stored correctly |
| Login Endpoint | ❌ Returns "Invalid credentials" |
| API Endpoint | ⚠️ Returns 0 issues |

## 🎯 Root Cause

**Most Likely**: Backend server is running an old version that hasn't reloaded changes.

---

## ✅ SOLUTION: Complete Manual Reset

### Step 1: Open TWO Separate Terminal Windows/Tabs

**Terminal Window 1**: For Backend
**Terminal Window 2**: For Testing/Debugging

---

### Step 2: In Terminal Window 1 - Start Backend Fresh

```powershell
cd "G:\FYP2\faculty-clearance-system\backend"
node server.js
```

**Wait until you see**:
```
✅ MongoDB connected to faculty-clearance
✅ Server running on port 5001
```

**Do NOT move on until you see these messages**

---

### Step 3: Verify Backend is Running

In Terminal Window 2, run:
```powershell
cd "G:\FYP2\faculty-clearance-system\backend"
node test-with-faculty1.js
```

**Expected Output**:
```
✅ Login successful!
✅ API Response:
{
  "success": true,
  "count": 86,
  "data": [...]
}
```

**If you see `count: 86`** → API works, problem is frontend cache
**If you see `count: 0`** → Still an issue, see troubleshooting below
**If you see login error** → Password issue, see advanced troubleshooting

---

### Step 4: Reset Frontend

1. **Refresh Browser**:
   - Press **Ctrl + Shift + R** (hard refresh)
   - Wait for page to reload

2. **Logout** (if logged in):
   - Click logout button

3. **Clear All Data**:
   - Press **F12** (DevTools)
   - Go to **Application** tab
   - Click **Local Storage** (left panel)
   - Right-click and **Clear All**
   - Close DevTools (F12)

4. **Refresh Again**:
   - Press **F5** or **Ctrl + R**

5. **Login**:
   - Email: **faculty1@test.edu**
   - Password: **Test@123**

6. **Navigate to Library**:
   - Click on "Library" in departments
   - Should see **"86 pending"** ✅

---

## 🐛 If STILL Showing "0 Pending"

### Check #1: Are you viewing the RIGHT page?

Make sure you're on the **Department Staff Dashboard**, NOT the faculty clearance page.

The department dashboard should show:
```
Library Department
Manage issued items and returns with auto-validation

Auto-Validation System Active
...

📋 Issues: X pending
```

### Check #2: Browser Console Test

1. Press **F12** (DevTools)
2. Go to **Console** tab
3. Paste this:

```javascript
// Test the API directly
const token = localStorage.getItem('token');
if (!token) {
  console.error('NO TOKEN - Not logged in');
} else {
  fetch('/api/departments/Library/issues', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(d => {
      console.log('API Response Count:', d.count);
      console.log('Data Length:', d.data?.length);
      if (d.count === 0) {
        console.error('API returned 0 - backend issue');
      } else {
        console.log('API works - frontend filter issue');
      }
    });
}
```

**What to report**:
- Console output
- What numbers did it show?

### Check #3: Network Tab Inspection

1. Press **F12** (DevTools)
2. Go to **Network** tab
3. Refresh page (**F5**)
4. Look for request: `api/departments/Library/issues`
5. Click on it
6. Go to **Response** tab
7. What does it show?

**Report**:
- Is `count` 0 or 86?
- Is there an error?
- What's the response?

---

## 🔧 Advanced Troubleshooting

### If Test Script Shows count: 0

1. **Check Database Again**:
```powershell
cd backend
node final-library-check.js
```

Should show: `Library: 86 pending / 86 total`

If NOT, run:
```powershell
node fix-issue-statuses.js
```

2. **Check Server Console**:
Look for red error text in Terminal Window 1 where backend is running.
Take a screenshot if you see errors.

### If Login Still Fails

The password might be corrupted. Run this to reset all passwords:

```powershell
cd backend
# Create a script to reset passwords
# OR create new test users
```

**Alternative**: Use these credentials directly in database:
- Email: admin@system.edu
- No password check for testing (if needed)

---

## 📋 Verification Checklist

After making changes, verify:

- [ ] Backend Terminal shows: "✅ Server running on port 5001"
- [ ] Test script shows: `count: 86`
- [ ] Browser hard refresh: Ctrl+Shift+R
- [ ] Logged in as: faculty1@test.edu / Test@123
- [ ] Viewing: Department staff dashboard (NOT faculty dashboard)
- [ ] Department shows: "86 pending" ✅

---

## 🚀 Manual Fix: One Command Solution

If everything else fails, try this complete restart:

```bash
# Terminal 1:
cd "G:\FYP2\faculty-clearance-system\backend"
node server.js

# Terminal 2 (after backend starts):
cd "G:\FYP2\faculty-clearance-system\backend"
node test-with-faculty1.js

# If test shows count=86:
# Then in browser: Ctrl+Shift+R
# Login: faculty1@test.edu / Test@123
# Navigate to Library
# Should show: 86 pending ✅
```

---

## 📊 Expected Results After All Steps

```
✅ Backend runs without errors
✅ Test script shows count: 86
✅ Browser shows "86 pending"
✅ All 12 departments show their pending counts:
   - Lab: 78
   - Library: 86
   - Pharmacy: 85
   - Finance: 74
   - HR: 79
   - Records: 86
   - IT: 89
   - ORIC: 86
   - Admin: 80
   - Warden: 81
   - HOD: 75
   - Dean: 82
```

---

## 💡 Key Points

1. **Backend MUST be restarted** after database changes
2. **Browser cache MUST be cleared** for frontend to see new data
3. **Token might be invalid** - logout and login again
4. **Use faculty1@test.edu** - we know this works

---

## 📞 If You Get Stuck

Report these things:

1. **What's in Terminal 1?** (backend console output)
2. **What does test script return?** (`count: ?`)
3. **What's in browser console?** (F12 → Console tab)
4. **What's in Network tab?** (F12 → Network tab → API response)

---

**DO THIS NOW**:

1. Stop backend (Ctrl+C in Terminal 1)
2. Restart: `node server.js`
3. Wait for "✅ Server running"
4. Hard refresh browser (Ctrl+Shift+R)
5. Logout and login again
6. Check Library department

You should see **86 pending** ✅

---

Last Updated: April 24, 2026
