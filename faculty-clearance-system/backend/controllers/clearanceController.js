const Clearance = require('../models/Clearance');
const ClearanceRequest = require('../models/ClearanceRequest');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const emailService = require('../utils/emailService');
const pdfService = require('../utils/pdfService');
const autoClearanceService = require('../services/autoClearanceService');

/**
 * Submit clearance request - 100% AUTOMATIC
 * NO human approval involved - system decides based on Issue/Return records
 * POST /api/clearance/submit
 */
exports.submitClearanceRequest = async (req, res) => {
  try {
    const { facultyId } = req.body;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Faculty ID is required'
      });
    }

    // Check if faculty exists
    const faculty = await User.findOne({ employeeId: facultyId });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Check if clearance request already exists and is completed
    const existingClearance = await Clearance.findOne({
      facultyId,
      overallStatus: 'Completed'
    });

    if (existingClearance) {
      return res.status(400).json({
        success: false,
        message: 'Faculty has already completed clearance',
        data: existingClearance
      });
    }

    // ========================================
    // AUTOMATIC CLEARANCE CHECKING
    // System decides ONLY based on Issue/Return data
    // NO manual approval whatsoever
    // ========================================
    const autoClearanceResult = await autoClearanceService.checkFacultyClearance(facultyId);

    if (!autoClearanceResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Clearance checking failed',
        error: autoClearanceResult.message
      });
    }

    // Initialize clearance record with automatic decision
    let clearanceRecord = new Clearance({
      facultyId,
      facultyName: faculty.name || (faculty.firstName + ' ' + faculty.lastName),
      facultyEmail: faculty.email,
      department: faculty.department,
      verificationToken: uuidv4(),
      phases: autoClearanceResult.phases,
      overallStatus: autoClearanceResult.overallStatus,
      rejectedDepartments: autoClearanceResult.rejectedDepartments,
      decidedBy: 'AUTOMATED_SYSTEM'  // Mark as automatic decision
    });

    // If ALL departments are approved, generate certificate and send email
    if (autoClearanceResult.overallStatus === 'Completed') {
      // Generate QR Code
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-clearance/${clearanceRecord.verificationToken}`;
      const qrCodeData = await QRCode.toDataURL(verificationUrl);
      clearanceRecord.qrCode = {
        data: qrCodeData,
        publicId: `qr-${clearanceRecord.verificationToken}`
      };

      // Generate PDF Certificate
      const certificateData = {
        facultyId: clearanceRecord.facultyId,
        facultyName: clearanceRecord.facultyName,
        clearanceId: clearanceRecord._id,
        issuedDate: new Date(),
        verificationToken: clearanceRecord.verificationToken
      };

      const pdfPath = await pdfService.generateCertificate(certificateData);
      clearanceRecord.certificatePath = pdfPath;
      clearanceRecord.completionDate = Date.now();

      // Send email with certificate (AUTOMATIC)
      await emailService.sendClearanceCompletionEmail({
        to: clearanceRecord.facultyEmail,
        facultyName: clearanceRecord.facultyName,
        facultyId: clearanceRecord.facultyId,
        certificatePath: pdfPath,
        qrCode: qrCodeData,
        verificationUrl
      });
    }

    // Save clearance record
    const savedClearance = await clearanceRecord.save();

    res.status(201).json({
      success: true,
      message: autoClearanceResult.overallStatus === 'Completed' 
        ? 'Clearance AUTOMATICALLY completed and approved for all departments' 
        : 'Clearance request AUTOMATICALLY rejected due to pending items',
      data: {
        ...savedClearance.toJSON(),
        decidedBy: 'AUTOMATED_SYSTEM'
      },
      rejectedDepartments: autoClearanceResult.rejectedDepartments
    });
  } catch (error) {
    console.error('Error submitting clearance request:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing clearance request',
      error: error.message
    });
  }
};

/**
 * Get clearance status for a faculty
 * GET /api/clearance/:facultyId
 */
exports.getClearanceStatus = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const clearance = await Clearance.findOne({ facultyId }).sort({ createdAt: -1 });

    if (!clearance) {
      return res.status(404).json({
        success: false,
        message: 'No clearance record found for this faculty'
      });
    }

    res.status(200).json({
      success: true,
      data: clearance
    });
  } catch (error) {
    console.error('Error fetching clearance status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clearance status',
      error: error.message
    });
  }
};

/**
 * Get all clearance records (Admin Only)
 * GET /api/clearance
 */
exports.getAllClearances = async (req, res) => {
  try {
    const { status, departmentName } = req.query;
    let query = {};

    if (status) query.overallStatus = status;
    if (departmentName) query.department = departmentName;

    const clearances = await Clearance.find(query)
      .sort({ createdAt: -1 })
      .select('-certificateUrl');

    res.status(200).json({
      success: true,
      count: clearances.length,
      data: clearances
    });
  } catch (error) {
    console.error('Error fetching clearances:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clearances',
      error: error.message
    });
  }
};

/**
 * Re-evaluate clearance (useful if issues are resolved)
 * POST /api/clearance/:facultyId/re-evaluate
 */
exports.reEvaluateClearance = async (req, res) => {
  try {
    const { facultyId } = req.params;

    // Delete previous clearance if exists
    await Clearance.deleteOne({ facultyId });

    // Resubmit clearance request
    req.body.facultyId = facultyId;
    await exports.submitClearanceRequest(req, res);
  } catch (error) {
    console.error('Error re-evaluating clearance:', error);
    res.status(500).json({
      success: false,
      message: 'Error re-evaluating clearance',
      error: error.message
    });
  }
};

/**
 * Verify clearance using token
 * GET /api/clearance/verify/:token
 */
exports.verifyClearance = async (req, res) => {
  try {
    const { token } = req.params;

    const clearance = await Clearance.findOne({
      verificationToken: token,
      overallStatus: 'Completed'
    });

    if (!clearance) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Clearance verified',
      data: {
        facultyId: clearance.facultyId,
        facultyName: clearance.facultyName,
        completionDate: clearance.completionDate,
        allPheasesApproved: clearance.phases.every(p => p.status === 'Approved')
      }
    });
  } catch (error) {
    console.error('Error verifying clearance:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying clearance',
      error: error.message
    });
  }
};

/**
 * Download certificate
 * GET /api/clearance/:facultyId/certificate
 */
exports.downloadCertificate = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const clearance = await Clearance.findOne({
      facultyId,
      overallStatus: 'Completed'
    });

    if (!clearance || !clearance.certificatePath) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    const fs = require('fs');
    const path = clearance.certificatePath;

    if (!fs.existsSync(path)) {
      return res.status(404).json({
        success: false,
        message: 'Certificate file not found on server'
      });
    }

    res.download(path, `Clearance_Certificate_${facultyId}.pdf`);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading certificate',
      error: error.message
    });
  }
};

/**
 * Get all approved faculty clearance records
 * GET /api/departments/approved-records/all
 * Returns all faculty with complete clearance status
 */
exports.getApprovedRecords = async (req, res) => {
  try {
    console.log('\n✅ [API] getApprovedRecords called');
    
    // Query ClearanceRequest model for cleared faculty records with populated user data
    const approvedRecords = await ClearanceRequest.find(
      { overall_status: 'Cleared' }
    )
      .populate('faculty_id', 'employee_id faculty_id full_name email')
      .select({
        faculty_id: 1,
        faculty_name: 1,
        email: 1,
        department: 1,
        overall_status: 1,
        departments: 1,
        cleared_at: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .sort({ cleared_at: -1, createdAt: -1 })
      .lean();

    console.log(`   Found ${approvedRecords.length} approved records`);

    // Enhance data with additional fields
    const enrichedRecords = approvedRecords.map(record => {
      // Count approved departments
      const approvedDepts = Object.keys(record.departments || {})
        .filter(dept => record.departments[dept]?.status === 'Approved')
        .join(', ');

      // Extract employee ID from populated user data
      const user = record.faculty_id || {};
      const employeeId = user.employee_id || user.faculty_id || 'N/A';

      return {
        _id: record._id,
        employeeId: employeeId,
        facultyName: record.faculty_name || user.full_name || 'N/A',
        email: record.email || user.email || 'N/A',
        department: record.department || 'N/A',
        clearanceDate: record.cleared_at || record.updatedAt || record.createdAt,
        approvedDepartments: approvedDepts || 'All',
        status: 'Approved'
      };
    });

    console.log(`   Returning ${enrichedRecords.length} enriched records\n`);

    return res.status(200).json({
      success: true,
      count: enrichedRecords.length,
      data: enrichedRecords
    });
  } catch (error) {
    console.error('❌ Error fetching approved records:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching approved records',
      error: error.message
    });
  }
};

/**
 * Get clearance statistics
 * GET /api/clearance/stats/dashboard
 */
exports.getClearanceStats = async (req, res) => {
  try {
    const totalClearances = await Clearance.countDocuments();
    const completedCount = await Clearance.countDocuments({ overallStatus: 'Completed' });
    const rejectedCount = await Clearance.countDocuments({ overallStatus: 'Rejected' });
    const inProgressCount = await Clearance.countDocuments({ overallStatus: 'In Progress' });

    // Department-wise rejection count
    const departmentStats = await Clearance.aggregate([
      { $unwind: '$rejectedDepartments' },
      {
        $group: {
          _id: '$rejectedDepartments.name',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalClearances,
        completedCount,
        rejectedCount,
        inProgressCount,
        completionRate: totalClearances > 0 ? ((completedCount / totalClearances) * 100).toFixed(2) : 0,
        departmentWiseRejections: departmentStats
      }
    });
  } catch (error) {
    console.error('Error fetching clearance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
