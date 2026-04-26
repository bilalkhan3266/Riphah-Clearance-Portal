require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005'
    ];
    
    // Add production CORS_ORIGIN if specified
    if (process.env.CORS_ORIGIN) {
      allowedOrigins.push(process.env.CORS_ORIGIN);
    }

    // Always allow Vercel deployment URLs
    allowedOrigins.push('https://riphahclearanceportal.vercel.app');

    // Allow all vercel.app preview URLs for this project
    if (origin && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Log CORS preflight requests  
app.options('*', (req, res) => {
  console.log('📋 [OPTIONS] CORS preflight request');
  console.log('   Origin:', req.headers['origin']);
  console.log('   Method:', req.headers['access-control-request-method']);
  res.sendStatus(200);
});

// Handle CORS errors with JSON response
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS: Origin not allowed',
      error: err.message
    });
  }
  next(err);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty_clearance';

console.log('🔄 Connecting to MongoDB...');
console.log('📍 Database:', MONGO_URI);
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected to faculty_clearance'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Check Email Configuration
console.log('\n📧 Email Configuration Check:');
const emailUser = process.env.EMAIL_USER || 'not-configured';
const emailPass = process.env.EMAIL_PASSWORD || 'not-configured';
if (emailUser === 'your-email@gmail.com' || emailUser === 'not-configured' || 
    emailPass === 'your-app-password' || emailPass === 'not-configured') {
  console.warn('⚠️  Email credentials are not properly configured!');
  console.warn('   Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
  console.warn('   Certificate emails will NOT work until configured');
} else {
  console.log('✅ Email credentials are configured');
}

// Routes
const authRoutes = require('./routes/authRoutes');
const clearanceRoutes = require('./routes/clearanceRoutes');
const clearanceAdminRoutes = require('./routes/clearanceAdminRoutes');
const clearanceIssuesRoutes = require('./routes/clearanceIssuesRoutes');  // Check pending issues
const departmentIssuesRoutes = require('./routes/departmentIssuesRoutes');  // Department issues display
const departmentRoutes = require('./routes/departmentRoutes');
const issuesRoutes = require('./routes/issuesRoutes');  // Simple issues API
const adminRoutes = require('./routes/adminRoutes');
const departmentMessageRoutes = require('./routes/departmentMessageRoutes');
const departmentEditRoutes = require('./routes/departmentEditRoutes');

app.use('/api', authRoutes);
app.use('/api', clearanceRoutes);
app.use('/api/clearance-issues', clearanceIssuesRoutes);  // Pending issues check
app.use('/api/department-issues', departmentIssuesRoutes);  // ✅ Department issues display
app.use('/api/issues', issuesRoutes);  // Issue/return operations
app.use('/api', clearanceAdminRoutes);
app.use('/api', departmentRoutes);
app.use('/api', adminRoutes);
app.use('/api/department-messages', departmentMessageRoutes);
app.use('/api/department-edit', departmentEditRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Simple Statistics Route (for demo)
app.get('/api/admin/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalRequests: 45,
      approvedCount: 30,
      pendingCount: 10,
      rejectedCount: 5
    }
  });
});

// Get Clearance Status Route
app.get('/api/clearance-status', require('./middleware/verifyToken'), async (req, res) => {
  try {
    const ClearanceRequest = require('./models/ClearanceRequest');
    const facultyId = req.user?.id;

    console.log('🔍 [GET /api/clearance-status] Request received');
    console.log('   Faculty ID:', facultyId);

    if (!facultyId) {
      console.log('   ❌ Faculty ID not found in token');
      return res.status(400).json({
        success: false,
        message: 'Faculty ID not found in token'
      });
    }

    // Find the latest clearance request for this faculty
    const request = await ClearanceRequest.findOne({ faculty_id: facultyId }).sort({ created_at: -1 });

    console.log('   📋 Request found:', !!request);

    if (!request) {
      // Return default pending status for all departments if no request submitted yet
      console.log('   ℹ️ No clearance request found - returning default pending statuses');
      const defaultData = [
        { department: 'Lab', status: 'Pending', approved_by: null, remarks: null },
        { department: 'Library', status: 'Pending', approved_by: null, remarks: null },
        { department: 'Pharmacy', status: 'Pending', approved_by: null, remarks: null },
        { department: 'Finance', status: 'Pending', approved_by: null, remarks: null },
        { department: 'HR', status: 'Pending', approved_by: null, remarks: null },
        { department: 'Records', status: 'Pending', approved_by: null, remarks: null },
        { department: 'IT', status: 'Pending', approved_by: null, remarks: null },
        { department: 'ORIC', status: 'Pending', approved_by: null, remarks: null },
        { department: 'Admin', status: 'Pending', approved_by: null, remarks: null },
        { department: 'Warden', status: 'Pending', approved_by: null, remarks: null },
        { department: 'HOD', status: 'Pending', approved_by: null, remarks: null },
        { department: 'Dean', status: 'Pending', approved_by: null, remarks: null }
      ];
      return res.json({
        success: true,
        data: defaultData,
        qr_code: null,
        overall_status: 'In Progress',
        cleared_at: null,
        faculty_name: req.user.full_name,
        faculty_email: req.user.email
      });
    }

    // Extract department statuses from the request
    const allDepartments = ['Lab', 'Library', 'Pharmacy', 'Finance', 'HR', 'Records', 'IT', 'ORIC', 'Admin', 'Warden', 'HOD', 'Dean'];
    const departmentStatuses = allDepartments.map(dept => {
      const deptData = request.departments?.[dept] || {};
      
      const status = deptData.status || 'Pending';

      console.log(`   ${dept}: ${status}`);

      return {
        department: dept,
        status: status,
        approved_by: deptData.approved_by || null,
        rejected_by: deptData.rejected_by || null,
        remarks: deptData.remarks || null,
        checked_at: deptData.checked_at || null
      };
    });

    console.log('   ✅ Returning', departmentStatuses.length, 'department statuses');
    console.log('   📊 Overall Status:', request.overall_status);
    console.log('   🎫 QR Code present:', !!request.qr_code);
    
    res.json({
      success: true,
      data: departmentStatuses,
      overall_status: request.overall_status || 'In Progress',
      qr_code: request.qr_code || null,
      cleared_at: request.cleared_at || null,
      current_phase: request.current_phase,
      faculty_name: request.faculty_name,
      faculty_email: request.email,
      request_id: request._id
    });
  } catch (err) {
    console.error('❌ Clearance status error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clearance status: ' + err.message
    });
  }
});

// WebSocket endpoint handler (prevents browser extension errors)
app.get('/ws', (req, res) => {
  res.status(200).json({ status: 'WebSocket endpoint available' });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'An error occurred'
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
