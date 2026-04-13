# Faculty Clearance System - New Project

## Project Structure

```
faculty-clearance-system/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── auth/               # Login/Signup pages
│   │   ├── components/         # Dashboards
│   │   ├── contexts/           # Auth Context
│   │   ├── routes/             # Protected routes
│   │   ├── App.js              # Main app
│   │   ├── index.js            # Entry point
│   │   └── index.css           # Global styles
│   ├── package.json
│   └── .env.example
│
└── backend/                    # Node.js Backend
    ├── models/                 # MongoDB Models
    ├── routes/                 # API Routes
    ├── middleware/             # Auth middleware
    ├── server.js               # Main server
    ├── package.json
    └── .env.example
```

## Setup Instructions

### Frontend Setup

```bash
cd faculty-clearance-system/frontend
npm install
```

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5001
```

Run frontend:
```bash
npm start
```
Frontend runs on: http://localhost:3001

### Backend Setup

```bash
cd faculty-clearance-system/backend
npm install
```

Create `.env` file:
```
PORT=5001
MONGO_URI=mongodb://localhost:27017/faculty_clearance
JWT_SECRET=your_super_secret_key
CORS_ORIGIN=http://localhost:3001
```

Run backend:
```bash
npm start
```

## Features

### Faculty (Faculty Member)
- ✅ Login/Signup
- ✅ View clearance status
- ✅ Submit clearance requests
- ✅ View dashboard

### Admin
- ✅ View all clearance requests
- ✅ Approve/Reject requests
- ✅ View system statistics
- ✅ Manage faculty accounts

## Technology Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs

## Roles

- **Faculty** (faculty): Can view and submit clearance requests
- **Admin** (admin): Can manage all clearance requests and view statistics

## Default Test Credentials

Faculty:
- Email: faculty@test.com
- Password: password123

Admin:
- Email: admin@test.com
- Password: password123

## Notes

- Your existing `my-app` project remains UNCHANGED in `g:\Part_3_Library\my-app\`
- This new project is completely separate
- Both can run simultaneously on different ports
- MongoDB should be running locally for the database to work
