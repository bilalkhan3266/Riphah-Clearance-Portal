# 🛠️ COMMON FRONTEND ISSUES CAUSING 401

## The Problem

Your React frontend is sending login requests but getting 401 errors back.

---

## Common Frontend Issues

### Issue 1: JSON Not Being Sent Correctly

❌ **WRONG** - Sending as form data:
```javascript
const response = await fetch('/api/login', {
  method: 'POST',
  body: new FormData(form)  // ❌ Wrong: FormData instead of JSON
});
```

✅ **CORRECT** - Send as JSON:
```javascript
const response = await fetch('http://localhost:5001/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: email,
    password: password
  })
});
```

---

### Issue 2: Missing Content-Type Header

❌ **WRONG**:
```javascript
fetch('http://localhost:5001/api/login', {
  method: 'POST',
  body: JSON.stringify({
    email: 'faculty1@test.edu',
    password: 'Test@123'
  })
  // ❌ Missing Content-Type header
});
```

✅ **CORRECT**:
```javascript
fetch('http://localhost:5001/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'  // ✅ Required
  },
  body: JSON.stringify({
    email: 'faculty1@test.edu',
    password: 'Test@123'
  })
});
```

---

### Issue 3: Wrong Email/Password Format

❌ **WRONG**:
```javascript
// ❌ Typo: lowercase password
body: JSON.stringify({
  email: 'faculty1@test.edu',
  password: 'test@123'  // Should be: Test@123 (capital T)
})

// ❌ Extra spaces
body: JSON.stringify({
  email: ' faculty1@test.edu ',  // Spaces around email
  password: 'Test@123'
})

// ❌ Non-existent email
body: JSON.stringify({
  email: 'nonexistent@test.edu',  // This user doesn't exist
  password: 'Test@123'
})
```

✅ **CORRECT**:
```javascript
body: JSON.stringify({
  email: 'faculty1@test.edu',  // Exact match (case-sensitive)
  password: 'Test@123'          // Exact match (case-sensitive)
})
```

---

### Issue 4: CORS Issues

❌ **WRONG** - Request might be blocked by CORS:
```javascript
// If backend doesn't have CORS enabled,
// browser blocks the request before it even reaches the server
fetch('http://localhost:5001/api/login', ...)
```

✅ **FIX** - Backend should have CORS enabled:

Check [backend/server.js](backend/server.js) has:
```javascript
const cors = require('cors');
app.use(cors());  // ✅ Allows frontend to make requests
```

If not present, add these lines:
```bash
npm install cors
```

Then in server.js:
```javascript
const cors = require('cors');
const app = express();
app.use(cors());  // Add this before routes
```

---

### Issue 5: Wrong URL Endpoint

❌ **WRONG**:
```javascript
// ❌ Missing localhost
fetch('/api/login', ...)

// ❌ Wrong port
fetch('http://localhost:3000/api/login', ...)

// ❌ Wrong path
fetch('http://localhost:5001/login', ...)
```

✅ **CORRECT**:
```javascript
fetch('http://localhost:5001/api/login', ...)
```

---

## Complete Working Example

### React Component
```javascript
import React, { useState } from 'react';

export function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ Correct: Full URL + JSON headers
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),  // Remove spaces
          password: password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ Save token
        localStorage.setItem('token', data.token);
        console.log('Login successful!');
        // Redirect to dashboard
      } else {
        // ❌ Show error
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="faculty1@test.edu"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Test@123"
        required
      />
      <button type="submit">Login</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </form>
  );
}
```

---

## Debugging Frontend Issues

### Step 1: Open Developer Tools
Press `F12` in browser

### Step 2: Go to Network Tab
- Click "Fetch/XHR" filter
- Try login

### Step 3: Click Failed Request
- Check "Request" tab
  - See the body being sent
  - Check Content-Type header
- Check "Response" tab
  - See the error message

### Step 4: Check Console Tab
Look for JavaScript errors:
```
SyntaxError: Unexpected token < in JSON at position 0
// Usually means response isn't JSON

TypeError: Cannot read property 'token' of undefined
// data.token is undefined - check response

Fetch failed: ...
// Network/CORS issue
```

---

## Using Axios (Alternative)

If using Axios instead of Fetch:

❌ **WRONG**:
```javascript
axios.post('/api/login', {
  email: 'faculty1@test.edu',
  password: 'Test@123'
})
```

✅ **CORRECT**:
```javascript
axios.post('http://localhost:5001/api/login', {
  email: 'faculty1@test.edu',
  password: 'Test@123'
}, {
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => {
  localStorage.setItem('token', res.data.token);
  console.log('Login successful!');
})
.catch(err => {
  console.log('Error:', err.response?.status, err.response?.data?.message);
});
```

---

## Testing Checklist

- [ ] Credentials are: `faculty1@test.edu` / `Test@123`
- [ ] URL is: `http://localhost:5001/api/login` (full URL)
- [ ] Method is: `POST`
- [ ] Content-Type header: `application/json`
- [ ] Body is valid JSON: `{"email":"...","password":"..."}`
- [ ] No typos in email or password
- [ ] Backend is running: `npm run dev`
- [ ] Check Network tab in DevTools
- [ ] Check Console for JavaScript errors
- [ ] Check backend logs for detailed error

---

## Quick Fix Commands

### If unsure about anything:

1. **Test from terminal** (most reliable):
```bash
cd backend
node test-login-endpoint.js
```

2. **Check all users exist**:
```bash
node -e "const mongoose = require('mongoose'); const User = require('./models/User'); mongoose.connect('mongodb://localhost:27017/faculty-clearance').then(async () => { const users = await User.find(); console.log('Users:', users.map(u => u.email)); mongoose.connection.close(); });"
```

3. **Check backend is running**:
```bash
npm run dev
# Should show: ✅ Server running on port 5001
```

---

## Still Having Issues?

1. **Copy-paste credentials**: Don't type, copy from above
2. **Restart backend**: Kill (Ctrl+C) and run `npm run dev` again
3. **Clear browser cache**: Ctrl+Shift+Delete
4. **Check backend logs**: Look for detailed error messages
5. **Run diagnostic**: `node diagnose-login.js`

---

**Status**: Frontend debugging ready! 🚀
