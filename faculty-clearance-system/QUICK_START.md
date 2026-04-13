# Faculty Clearance System - Quick Start Card 🚀

## 5-Minute Setup

### Prerequisites
✅ Node.js v14+ installed
✅ MongoDB running locally (`mongod`)
✅ Git Bash or PowerShell terminal

---

## 🚀 Step 1: Backend Setup (2 minutes)

```powershell
cd g:\Part_3_Library\faculty-clearance-system\backend
npm install
npm start
```

**Expected Output:**
```
🔄 Connecting to MongoDB...
✅ MongoDB connected
🚀 Server running on port 5001
```

✅ **DONE** - Backend ready!

---

## 🎨 Step 2: Frontend Setup (2 minutes)

**Open NEW terminal/PowerShell**

```powershell
cd g:\Part_3_Library\faculty-clearance-system\frontend
npm install
npm start
```

**Expected Output:**
```
Compiled successfully!
Local:  http://localhost:3001
```

✅ **DONE** - Frontend opens automatically!

---

## 🧪 Step 3: Test Login (1 minute)

### Option A: Create New Account
1. Click "Sign Up" on the page
2. Fill in:
   - Full Name: `Test Faculty`
   - Email: `test@test.com`
   - Password: `Test123!`
   - Designation: `Professor`
   - Department: `Computer Science`
3. Click **Sign Up**
4. Click **Login** and use same email/password

### Option B: Use Pre-configured Test Account
1. Email: `faculty@test.com`
2. Password: `password123`
3. Click **Login**

✅ **You're in!** Faculty Dashboard now visible

---

## 📂 Project File Locations

| What | Where |
|------|-------|
| **Backend Start** | `g:\Part_3_Library\faculty-clearance-system\backend` |
| **Frontend Start** | `g:\Part_3_Library\faculty-clearance-system\frontend` |
| **Backend Config** | `backend\.env` |
| **Frontend Config** | `frontend\.env` |
| **Documentation** | `SETUP_GUIDE.md` |
| **Architecture** | `ARCHITECTURE_GUIDE.md` |

---

## ⚡ Common Commands

```powershell
# Backend
cd backend && npm start           # Start server on :5001
cd backend && npm install         # Install dependencies

# Frontend
cd frontend && npm start          # Start React on :3001
cd frontend && npm install        # Install dependencies

# Stop Server
Ctrl + C                          # Stop current terminal process
```

---

## 🔧 Configuration Files

### Backend (.env)
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/faculty_clearance
JWT_SECRET=faculty_clearance_system_secret_key_2024
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001
```

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| `Port 5001 in use` | Change PORT in backend/.env or kill process on port 5001 |
| `MongoDB Error` | Start MongoDB: `mongod` in separate terminal |
| `npm not found` | Install Node.js from nodejs.org |
| `CORS Error` | Check backend CORS_ORIGIN matches frontend URL |
| `Blank Page` | Clear browser cache (Ctrl+Shift+Delete) |

---

## ✨ What You Get

✅ **Full Authentication System**
- Signup with email/password
- Login with role-based redirect
- Secure JWT tokens
- Persistent sessions

✅ **Role-Based Access**
- Faculty sees their clearance status
- Admin sees all requests
- Protected routes with auto-redirect

✅ **Professional UI**
- Dark blue (#003366) + Orange (#ff6b35) theme
- Clean, modern design
- Responsive layout

✅ **Production-Ready Code**
- Error handling
- Input validation
- Password hashing
- CORS enabled

---

## 📊 System Status

```
✅ Backend:     Express.js + MongoDB
✅ Frontend:    React 18 + React Router
✅ Auth:        JWT (7-day expiration)
✅ Database:    Mongoose schemas
✅ API Routes:  Signup, Login ready
✅ Dashboards:  Faculty & Admin

🔄 In Progress:
├── Clearance workflow
├── Messaging system
└── Admin management
```

---

## 🎯 Next Features to Build

1. **Clearance Request Submission**
   - Faculty submits requests
   - Admin approves/rejects
   - Status updates

2. **Messaging System**
   - Two-way chat
   - Notifications
   - Message history

3. **Document Upload**
   - Faculty uploads documents
   - Admin reviews
   - Storage management

4. **Email Notifications**
   - Registration confirmation
   - Status updates
   - Messages

---

## 📞 Quick Reference

| URL | Purpose |
|-----|---------|
| http://localhost:3001 | Frontend access |
| http://localhost:5001 | Backend API |
| http://localhost:5001/api/health | Server check |

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/signup | POST | Create account |
| /api/login | POST | User login |
| /api/admin/stats | GET | Stats (demo) |

---

## 🎉 You're All Set!

1. ✅ Both servers running
2. ✅ Frontend loaded
3. ✅ Ready to develop

**Happy Coding!** 🚀

---

## 📖 Read Next

- **Setup Guide**: `SETUP_GUIDE.md` - Full detailed setup
- **Architecture**: `ARCHITECTURE_GUIDE.md` - System design
- **Completion Report**: `PROJECT_COMPLETION_REPORT.md` - What was built
- **README**: `README.md` - Project overview

---

**Remember**: Your original `my-app` project is 100% preserved at `g:\Part_3_Library\my-app\` 🔒
