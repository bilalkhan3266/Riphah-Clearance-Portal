const Clearance = require('../models/Clearance');

/**
 * Get all approved faculty clearance records
 * GET /api/departments/approved-records/all
 * Returns all faculty with complete clearance status
 */
exports.getApprovedRecords = async (req, res) => {
  try {
    console.log('\n🔍 [API] Fetching approved records...');
    
    // Fetch all clearance records where overallStatus is 'Completed'
    const approvedRecords = await Clearance.find(
      { overallStatus: 'Completed' },
      {
        facultyId: 1,
        facultyName: 1,
        facultyEmail: 1,
        department: 1,
        completionDate: 1,
        phases: 1,
        submissionDate: 1,
        createdAt: 1
      }
    )
      .sort({ completionDate: -1 })
      .lean();

    console.log(`✅ Found ${approvedRecords.length} completed clearances`);
    
    if (approvedRecords.length > 0) {
      console.log('Sample records:');
      approvedRecords.slice(0, 2).forEach(r => {
        console.log(`  - ${r.facultyId}: ${r.facultyName}`);
      });
    }

    // Enhance data with additional fields
    const enrichedRecords = approvedRecords.map(record => ({
      _id: record._id,
      facultyId: record.facultyId,
      facultyName: record.facultyName || 'N/A',
      facultyEmail: record.facultyEmail,
      department: record.department || 'N/A',
      clearanceDate: record.completionDate || record.createdAt,
      submissionDate: record.submissionDate,
      totalIssues: record.phases ? record.phases.length : 0,
      approvedDepartments: record.phases
        ? record.phases
            .filter(p => p.status === 'Approved')
            .map(p => p.name)
            .join(', ')
        : '',
      status: 'Approved'
    }));

    console.log(`📤 Returning ${enrichedRecords.length} enriched records\n`);

    return res.status(200).json({
      success: true,
      count: enrichedRecords.length,
      data: enrichedRecords
    });
  } catch (error) {
    console.error('Error fetching approved records:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching approved records',
      error: error.message
    });
  }
};

/**
 * Get approved records for a specific department
 * GET /api/departments/:departmentName/approved-records
 */
exports.getApprovedRecordsForDepartment = async (req, res) => {
  try {
    const { departmentName } = req.params;

    const approvedRecords = await Clearance.find(
      {
        $and: [
          { overallStatus: 'Completed' },
          {
            'phases': {
              $elemMatch: {
                name: departmentName,
                status: 'Approved'
              }
            }
          }
        ]
      },
      {
        facultyId: 1,
        facultyName: 1,
        facultyEmail: 1,
        department: 1,
        completionDate: 1,
        phases: 1,
        createdAt: 1
      }
    )
      .sort({ completionDate: -1 })
      .lean();

    const enrichedRecords = approvedRecords.map(record => ({
      _id: record._id,
      facultyId: record.facultyId,
      facultyName: record.facultyName || 'N/A',
      facultyEmail: record.facultyEmail,
      department: departmentName,
      clearanceDate: record.completionDate || record.createdAt,
      totalDepartments: record.phases ? record.phases.length : 0,
      status: 'Approved'
    }));

    return res.status(200).json({
      success: true,
      count: enrichedRecords.length,
      data: enrichedRecords
    });
  } catch (error) {
    console.error('Error fetching approved records for department:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching approved records',
      error: error.message
    });
  }
};

/**
 * Get clearance statistics
 * GET /api/departments/clearance-stats
 */
exports.getClearanceStats = async (req, res) => {
  try {
    const totalRecords = await Clearance.countDocuments();
    const approvedCount = await Clearance.countDocuments({ overallStatus: 'Completed' });
    const rejectedCount = await Clearance.countDocuments({ overallStatus: 'Rejected' });
    const inProgressCount = await Clearance.countDocuments({ overallStatus: 'In Progress' });

    return res.status(200).json({
      success: true,
      stats: {
        total: totalRecords,
        approved: approvedCount,
        rejected: rejectedCount,
        inProgress: inProgressCount,
        approvalRate: totalRecords > 0 ? ((approvedCount / totalRecords) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    console.error('Error fetching clearance stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching clearance statistics',
      error: error.message
    });
  }
};
