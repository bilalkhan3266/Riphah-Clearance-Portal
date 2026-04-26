# 🔐 401 UNAUTHORIZED ERROR - COMPLETE GUIDE

## ❌ Error Explanation

```
:5001/api/login:1  Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

**401 Unauthorized** means the server **rejected your login credentials**. This happens when:

| Reason | Cause |
|--------|-------|
| **Invalid Credentials** | Email or password doesn't match database |
| **User Not Found** | Email doesn't exist in system |
| **Wrong Password** | Encrypted password doesn't match |
| **Missing Request Body** | Email/password not sent in request |
| **Request Format Error** | JSON malformed or missing Content-Type |

---

## ✅ Available Test Credentials

These users **EXIST** in the database and can login:

```javascript
// Faculty Users (can submit clearance)
Email: faculty1@test.edu
Password: Test@123

Email: faculty2@test.edu
Password: Test@123

// Department Staff Users (can approve issues)
Email: lab@test.edu
Password: Test@123

Email: library@test.edu
Password: Test@123

// Admin User
Email: admin@system.edu
Password: Test@123
```

---

## 🔧 How to Fix 401 Error

### Option 1: Use Correct Credentials
Make sure you're sending the **exact** credentials above:

```bash
# Using cURL
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "faculty1@test.edu",
    "password": "Test@123"
  }'

# Expected Response (Success):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "faculty1@test.edu",
    "full_name": "Dr. Ahmed Hassan",
    "role": "faculty"
  }
}
```

### Option 2: Check Backend Logs

When you run `npm run dev`, you'll see detailed error messages:

```
❌ User not found: wrong-email@test.edu
❌ Password mismatch
✅ Token generated
✅ Login response sent successfully
```

**Look for these messages in your terminal** to understand the specific 401 cause.

### Option 3: From Browser Console

If you're testing from frontend, open **Developer Tools** (F12) and check:

1. **Network Tab**:
   - Click the failed login request
   - Check `Request` → `Payload` → verify JSON is correct
   - Check `Response` → see the 401 error details

2. **Console Tab**:
   - Look for fetch/axios error messages
   - Check if Content-Type is set to `application/json`

---

## 🧪 Complete Login Test Steps

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
# Should see: ✅ Server running on port 5001
```

### Step 2: Open Browser Dev Tools
```
Press F12 → Network Tab
```

### Step 3: Try Login with Test Credentials

**Option A - React Frontend**:
1. Go to `http://localhost:3000`
2. Click Login
3. Enter:
   - Email: `faculty1@test.edu`
   - Password: `Test@123`
4. Click Submit
5. Check Network tab for response

**Option B - Using cURL** (in terminal):
```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty1@test.edu","password":"Test@123"}'
```

**Option C - Using Postman**:
1. Create new POST request
2. URL: `http://localhost:5001/api/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "faculty1@test.edu",
  "password": "Test@123"
}
```

### Step 4: Check Response

✅ **Success Response**:
```json
{
  "success": true,
  "token": "eyJhbGci..."
}
```

❌ **401 Error Response**:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 🐛 Common Mistakes

| Mistake | Fix |
|---------|-----|
| **Missing quotes around email** | Use: `"email": "faculty1@test.edu"` |
| **Wrong password case** | Exact: `Test@123` (capital T, @, 123) |
| **Spaces in email** | Remove any spaces around email |
| **Content-Type not set** | Add header: `Content-Type: application/json` |
| **Sending FormData instead of JSON** | Use JSON format with stringify |
| **Email typo** | Copy-paste from: `faculty1@test.edu` |

---

## 📊 Request/Response Examples

### ❌ WRONG - Will cause 401

```javascript
// Wrong: FormData instead of JSON
const formData = new FormData();
formData.append('email', 'faculty1@test.edu');
formData.append('password', 'Test@123');
fetch('http://localhost:5001/api/login', {
  method: 'POST',
  body: formData
});

// Wrong: Missing Content-Type
fetch('http://localhost:5001/api/login', {
  method: 'POST',
  body: JSON.stringify({...})
  // Missing: headers: {'Content-Type': 'application/json'}
});

// Wrong: Typo in password
{
  "email": "faculty1@test.edu",
  "password": "test@123"  // ❌ lowercase 't'
}

// Wrong: Email doesn't exist
{
  "email": "nonexistent@test.edu",
  "password": "Test@123"
}
```

### ✅ CORRECT - Will succeed

```javascript
// JavaScript Fetch
fetch('http://localhost:5001/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'faculty1@test.edu',
    password: 'Test@123'
  })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('Token:', data.token);
    localStorage.setItem('token', data.token);
  }
});

// Axios
axios.post('http://localhost:5001/api/login', {
  email: 'faculty1@test.edu',
  password: 'Test@123'
})
.then(res => {
  console.log('Token:', res.data.token);
})
.catch(err => console.log('Error:', err.response.status));

// cURL
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"faculty1@test.edu","password":"Test@123"}'
```

---

## 🔄 Authentication Flow

```
1. User enters credentials
         ↓
2. Frontend sends POST to /api/login
   Body: {email, password}
         ↓
3. Backend receives request
   - Logs: 📝 [POST /login] Request received
   - Extracts email, password
         ↓
4. Backend queries User collection
   - Searches: User.findOne({email})
         ↓
5. Check Results:
   ✅ User found? → Verify password
   ❌ User NOT found? → Return 401 "Invalid credentials"
         ↓
6. Password verification:
   ✅ Match? → Generate JWT token
   ❌ No match? → Return 401 "Invalid credentials"
         ↓
7. Success:
   Return 200 with token
   Frontend stores token in localStorage
         ↓
8. Subsequent requests:
   Include token in Authorization header
   Example: Authorization: Bearer eyJhbGci...
```

---

## 📋 Debugging Checklist

When you see 401 error, check these in order:

- [ ] **Backend running?** 
  - Check terminal: `npm run dev` is outputting logs
  
- [ ] **Correct endpoint?**
  - URL should be: `http://localhost:5001/api/login`
  
- [ ] **Correct email?**
  - Use: `faculty1@test.edu` (check spelling)
  
- [ ] **Correct password?**
  - Use: `Test@123` (exact case and characters)
  
- [ ] **JSON format?**
  - `{"email":"faculty1@test.edu","password":"Test@123"}`
  
- [ ] **Content-Type header?**
  - Should be: `application/json`
  
- [ ] **Check backend logs**
  - Look for: ❌ User not found OR ❌ Password mismatch
  
- [ ] **User exists in DB?**
  - Run: `node diagnose-login.js`

---

## 🆘 Still Getting 401?

### Step 1: Enable Backend Logging
Edit [backend/routes/authRoutes.js](backend/routes/authRoutes.js) - it already has detailed logging.

### Step 2: Check Server Logs
Look at the terminal running `npm run dev`:
```
🔐 [POST /login] Request received
   Email: faculty1@test.edu
   Password length: 8
   ❌ User not found: faculty1@test.edu
```

### Step 3: Verify User Exists
Run this command:
```bash
node -e "const mongoose = require('mongoose'); const User = require('./models/User'); mongoose.connect('mongodb://localhost:27017/faculty-clearance').then(async () => { const users = await User.find(); console.log('Users:', users.map(u => u.email)); mongoose.connection.close(); });"
```

### Step 4: Check Password Encryption
The system **automatically hashes passwords** before storing:
- You **never** store plain text passwords
- When you login, system compares: `bcrypt.compare(inputPassword, hashedPassword)`
- Test users have password: `Test@123` (which is hashed in DB)

---

## 📞 Need Help?

| Issue | Action |
|-------|--------|
| Don't know which credentials to use | Use: `faculty1@test.edu` / `Test@123` |
| Can't access frontend | Verify: `npm start` running on port 3000 |
| Backend not responding | Check: `npm run dev` in backend folder |
| Got different error (not 401) | Check error message - could be 400, 500, etc |
| Credentials seem right but still 401 | Check backend logs for exact reason |

---

## ✅ Success Indicators

Login is working when you see:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "faculty1@test.edu",
    "full_name": "Dr. Ahmed Hassan",
    "role": "faculty",
    "faculty_id": null,
    "employee_id": null
  }
}
```

Then your token can be used for:
- Accessing protected routes
- Submitting clearance
- Viewing clearance status
- Making authenticated API calls

---

**Last Updated**: April 24, 2026
