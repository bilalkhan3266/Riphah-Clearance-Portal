# Faculty Clearance System - Visual Architecture Guide

## 🏗️ System Architecture Diagram

```
USER BROWSER
    │
    ├──────────────────────────────────────────────────────────┤
    │                                                          │
    ▼ (http://localhost:3001)                   ▼ (http://localhost:3000)
    
FACULTY CLEARANCE SYSTEM                    STUDENT CLEARANCE SYSTEM (my-app)
┌────────────────────────────────┐          ┌──────────────────────────────┐
│  React Frontend (port 3001)    │          │  React Frontend (port 3000)  │
│  ├── Login Page                │          │  ├── Login Page             │
│  ├── Signup Page               │          │  ├── Signup Page            │
│  ├── Faculty Dashboard         │          │  ├── Student Dashboard      │
│  └── Admin Dashboard           │          │  └── Department Dashboards  │
└──────┬───────────────────────┘          └────────┬───────────────────┘
       │ axios/fetch                            │ axios/fetch
       │ http://localhost:5001                  │ http://localhost:5000
       ▼                                        ▼
┌────────────────────────────────┐          ┌──────────────────────────────┐
│  Node.js REST API (port 5001)  │          │  Node.js REST API (port 5000) │
│  ├── /api/signup               │          │  ├── /api/signup            │
│  ├── /api/login                │          │  ├── /api/login             │
│  ├── /api/admin/stats          │          │  ├── /api/student/status    │
│  └── /api/clearance-status     │          │  └── /api/departments       │
└──────┬───────────────────────┘          └────────┬───────────────────┘
       │                                        │
       │ MongoDB Connection                     │ MongoDB Connection
       │ mongodb://localhost:27017              │ mongodb://localhost:27017
       │ database: faculty_clearance            │ database: student_clearance
       ▼                                        ▼
    ┌─────────────────────┐              ┌─────────────────────┐
    │  MongoDB Database   │              │  MongoDB Database   │
    ├─ Collections:      │              ├─ Collections:      │
    │  • users           │              │  • users           │
    │  • clearance...    │              │  • clearance...    │
    │  • messages        │              │  • messages        │
    │  • notifications   │              │  • departments     │
    └─────────────────────┘              └─────────────────────┘
```

## 📂 File System Structure (Disk Layout)

```
g:\Part_3_Library\
│
├── my-app/                     ← ORIGINAL PROJECT
│   ├── frontend/
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json (port 3000)
│   ├── backend/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── server.js
│   │   └── package.json (port 5000)
│   └── 150+ documentation files
│
└── faculty-clearance-system/   ← NEW PROJECT
    ├── frontend/
    │   ├── src/
    │   │   ├── auth/
    │   │   ├── components/
    │   │   ├── contexts/
    │   │   ├── routes/
    │   │   ├── App.js
    │   │   ├── index.js
    │   │   └── index.css
    │   ├── public/
    │   │   └── index.html
    │   ├── package.json (port 3001)
    │   ├── .env
    │   └── .env.example
    ├── backend/
    │   ├── models/
    │   │   ├── User.js
    │   │   └── ClearanceRequest.js
    │   ├── routes/
    │   │   └── authRoutes.js
    │   ├── middleware/
    │   │   └── verifyToken.js
    │   ├── server.js
    │   ├── package.json (port 5001)
    │   ├── .env
    │   └── .env.example
    ├── README.md
    ├── SETUP_GUIDE.md
    └── PROJECT_COMPLETION_REPORT.md
```

## 🔄 Authentication Flow Diagram (Faculty Clearance System)

```
┌─────────────────────────────────────────────────────────┐
│  USER ACCESSES http://localhost:3001                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  Check localStorage│
        │  for auth token    │
        └────────┬───────────┘
                 │
        ┌────────┴─────────┐
        │                  │
    Token Found        No Token Found
        │                  │
        │                  ▼
        │          ┌───────────────┐       ┌──────────────┐
        │          │  SIGNUP PAGE  │────→  │  Form input  │
        │          └───────┬───────┘       │ - Full Name  │
        │                  │               │ - Email      │
        │                  │               │ - Password   │
        │                  │               │ - Designation
        │                  │               │ - Department │
        │                  │               └──────────────┘
        │                  │
        │                  ▼
        │          ┌──────────────────────────────────┐
        │          │ POST /api/signup                 │
        │          │ ├── Validate input               │
        │          │ ├── Hash password (bcryptjs)     │
        │          │ ├── Save to MongoDB              │
        │          │ └── Success response             │
        │          └──────────┬───────────────────────┘
        │                     │
        │                     ▼
        │          ┌───────────────────┐
        │          │  LOGIN PAGE       │
        │          │ - Email           │
        │          │ - Password        │
        │          │ - Login Button    │
        │          └─────────┬─────────┘
        │                    │
        │                    ▼
        │          ┌──────────────────────────────────┐
        │          │ POST /api/login                  │
        │          │ ├── Find user by email           │
        │          │ ├── Verify password (bcryptjs)   │
        │          │ ├── Generate JWT token           │
        │          │ └── Return token + user info     │
        │          └──────────┬───────────────────────┘
        │                     │
        │                     ▼
        │          ┌──────────────────────────────────┐
        │          │ Frontend receives token          │
        │          │ ├── Save to localStorage         │
        │          │ ├── Extract user role            │
        │          │ ├── Set AuthContext              │
        │          └──────────┬───────────────────────┘
        │                     │
        └─────────┬──────────┘
                  │
        Role Validation
                  │
        ┌─────────┴──────────┐
        │                    │
    role='faculty'      role='admin'
        │                    │
        ▼                    ▼
┌─────────────────────┐  ┌──────────────────┐
│ FACULTY DASHBOARD   │  │  ADMIN DASHBOARD │
├─────────────────────┤  ├──────────────────┤
│ • View clearance    │  │ • View all reqs  │
│   status            │  │ • Statistics     │
│ • Submit requests   │  │ • Approve/Reject │
│ • Messages          │  │ • Users mgmt     │
└─────────────────────┘  └──────────────────┘
        │                    │
        └─────────┬──────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  Logout Button      │
        │  ├── Clear token    │
        │  │   from storage   │
        │  ├── Reset auth ctx │
        │  └── Redirect login │
        └─────────────────────┘
```

## 📨 API Request/Response Cycle

```
Frontend (React)
    │
    ├─ New User sees Signup
    │       │
    │       └─ Fill form (name, email, password, dept)
    │           │
    │           ▼
    │      [SIGNUP BUTTON]
    │           │
    │           ▼
    │      axios.post('/api/signup', {
    │        full_name: 'Dr. Jane Smith',
    │        email: 'jane@uni.edu',
    │        password: 'SecurePass123',
    │        designation: 'Professor',
    │        department: 'Physics',
    │        role: 'faculty'
    │      })
    │           │
    │           ├─ NETWORK REQUEST →
    │           │  (http://localhost:5001/api/signup)
    │           │
    │           └─ Backend Processes
    │              ├─ Validate input
    │              ├─ Check email unique
    │              ├─ Hash password
    │              ├─ Save user (MongoDB)
    │              └─ Send response
    │                   │
    │           ← RESPONSE RECEIVED
    │           {
    │             success: true,
    │             message: 'Account created successfully'
    │           }
    │                   │
    │                   ▼
    │           [REDIRECT TO LOGIN]
    │
    │
    ▼
    Returning User sees Login
        │
        ├─ Enter email & password
        │
        ▼
        [LOGIN BUTTON]
            │
            ▼
        axios.post('/api/login', {
          email: 'jane@uni.edu',
          password: 'SecurePass123'
        })
            │
            ├─ NETWORK REQUEST →
            │  (http://localhost:5001/api/login)
            │
            └─ Backend Processes
               ├─ Find user
               ├─ Compare passwords
               ├─ Create JWT token
               └─ Send response
                    │
            ← RESPONSE RECEIVED
            {
              success: true,
              message: 'Login successful',
              token: 'eyJhbGc...',
              user: {
                id: '507f1f77bcf86cd799439011',
                full_name: 'Dr. Jane Smith',
                email: 'jane@uni.edu',
                role: 'faculty',
                department: 'Physics'
              }
            }
                    │
                    ▼
            ✅ localStorage.setItem('token', token)
            ✅ AuthContext updated
            ✅ Redirect to dashboard
```

## 🔐 Protected Routes

```
ProtectedRoute Component
    │
    ├─ Check if user is authenticated?
    │       │
    │   ┌───┴────┐
    │   │        │
    ▼ No      ▼ Yes
    │         │
Redirect    ├─ Get user role
Login       │
    ▼       │
    │    ┌──┴────────┐
    │    │           │
    │  ▼ role       ▼ role
    │  'faculty'    'admin'
    │    │           │
    │    ├─ Render   ├─ Render
    │    │ Faculty   │ Admin
    │    │ Dashboard │ Dashboard
    │    │           │
    └────┴───────────┘
```

## 💾 Database Schema (MongoDB)

### Users Collection
```javascript
{
  _id: ObjectId('507f1f77bcf86cd799439011'),
  full_name: 'Dr. Jane Smith',
  email: 'jane.smith@university.edu',
  password: '$2a$10$L9AT...hashvalue...',      // hashed with bcryptjs
  role: 'faculty',                             // or 'admin'
  designation: 'Associate Professor',
  department: 'Physics',
  verified: true,
  verification_code: null,
  created_at: ISODate('2024-01-15T10:30:00Z'),
  updated_at: ISODate('2024-01-15T10:30:00Z')
}
```

### ClearanceRequests Collection
```javascript
{
  _id: ObjectId('507f1f77bcf86cd799439012'),
  faculty_id: ObjectId('507f1f77bcf86cd799439011'),
  faculty_name: 'Dr. Jane Smith',
  department: 'Physics',
  status: 'Pending',                          // or 'Approved' or 'Rejected'
  remarks: 'All documents pending review',
  approved_by: null,
  approved_at: null,
  created_at: ISODate('2024-01-15T11:00:00Z'),
  updated_at: ISODate('2024-01-15T11:00:00Z')
}
```

## 🎨 UI Layout Breakdown

### Login Page
```
┌──────────────────────────────────┐
│   Faculty Clearance System       │
│      [Logo/Branding]             │
├──────────────────────────────────┤
│                                  │
│  Email Address                   │
│  ┌────────────────────────────┐  │
│  │ faculty@test.com           │  │
│  └────────────────────────────┘  │
│                                  │
│  Password                        │
│  ┌────────────────────────────┐  │
│  │ ••••••••••••               │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │   [ LOGIN BUTTON ]         │  │
│  │    (Orange #ff6b35)        │  │
│  └────────────────────────────┘  │
│                                  │
│  Don't have account? Sign up →   │
│                                  │
└──────────────────────────────────┘
Color Theme: Dark Blue (#003366) header, Orange button
```

### Dashboard (Faculty)
```
┌──────────────────────────────────────────┐
│  Faculty Dashboard        [Logout]        │
├──────────────────────────────────────────┤
│                                          │
│  Welcome, Dr. Jane Smith                 │
│  Department: Physics                     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Clearance Status                   │  │
│  ├────────────────────────────────────┤  │
│  │ Finance:          ✅ Approved      │  │
│  │ Academic Affairs: ⏳ Pending       │  │
│  │ Library:          ✅ Approved      │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
Color Theme: Green checkmarks (#10b981), Orange pending
```

## ✅ Sequential Startup Guide (Both Projects)

```
Terminal 1 - Student System (my-app)
├── cd g:\Part_3_Library\my-app\backend
├── npm start
└── ✅ Listening on port 5000
    
Terminal 2 - Faculty System (faculty-clearance-system)
├── cd g:\Part_3_Library\faculty-clearance-system\backend
├── npm start
└── ✅ Listening on port 5001

Terminal 3 - Student Frontend
├── cd g:\Part_3_Library\my-app\frontend
├── npm start
└── ✅ Browser opens http://localhost:3000

Terminal 4 - Faculty Frontend
├── cd g:\Part_3_Library\faculty-clearance-system\frontend
├── npm start
└── ✅ Browser opens http://localhost:3001

RESULT: Both systems running simultaneously
├── my-app: http://localhost:3000 & http://localhost:5000
└── faculty-clearance-system: http://localhost:3001 & http://localhost:5001
```

---

**This architecture ensures complete isolation between projects while maintaining identical technology stacks.**
