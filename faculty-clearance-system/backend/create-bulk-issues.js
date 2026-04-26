const mongoose = require('mongoose');
const Issue = require('./models/Issue');

const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/faculty-clearance';

// Faculty IDs to create issues for
const facultyIds = Array.from({ length: 40 }, (_, i) => String(3331 + i));

// Department-specific items based on their roles
const departmentItems = {
  'Lab': [
    { itemType: 'Microscope Set', description: 'Optical microscope with slides and covers', quantity: 1 },
    { itemType: 'Chemical Safety Equipment', description: 'Safety goggles, gloves, lab coat', quantity: 3 },
    { itemType: 'Lab Equipment', description: 'Beakers, flasks, burettes, pipettes', quantity: 5 },
    { itemType: 'Reagents Kit', description: 'Chemical reagents for experiments', quantity: 2 }
  ],
  'Library': [
    { itemType: 'Textbooks', description: 'Academic reference textbooks', quantity: 4 },
    { itemType: 'Research Journals', description: 'Peer-reviewed journal articles', quantity: 6 },
    { itemType: 'Rare Books', description: 'Heritage and special collection books', quantity: 2 },
    { itemType: 'Reference Materials', description: 'Encyclopedias and reference guides', quantity: 3 }
  ],
  'Pharmacy': [
    { itemType: 'Medicine Bottles', description: 'Prescribed medication containers', quantity: 8 },
    { itemType: 'Medical Equipment', description: 'Thermometer, blood pressure monitor', quantity: 2 },
    { itemType: 'Pharmaceutical Samples', description: 'Drug samples for education', quantity: 5 },
    { itemType: 'Medical Supplies', description: 'Bandages, syringes, sterile equipment', quantity: 10 }
  ],
  'Finance': [
    { itemType: 'Finance Documents', description: 'Budget files, financial statements', quantity: 5 },
    { itemType: 'Receipt Books', description: 'Official receipt books for transactions', quantity: 2 },
    { itemType: 'Vouchers', description: 'Expense and payment vouchers', quantity: 15 },
    { itemType: 'Financial Records', description: 'Ledgers and financial reports', quantity: 3 }
  ],
  'HR': [
    { itemType: 'Employee Files', description: 'Personal employee records and documents', quantity: 1 },
    { itemType: 'Contract Documents', description: 'Employment contracts and agreements', quantity: 2 },
    { itemType: 'Leave Records', description: 'Annual and sick leave documentation', quantity: 3 },
    { itemType: 'Payroll Documents', description: 'Salary slips and tax documents', quantity: 12 }
  ],
  'Records': [
    { itemType: 'Academic Records', description: 'Student transcripts and grade sheets', quantity: 5 },
    { itemType: 'Degree Certificates', description: 'Issued diplomas and certificates', quantity: 2 },
    { itemType: 'Enrollment Documents', description: 'Admission letters and registration forms', quantity: 3 },
    { itemType: 'Official Transcripts', description: 'Verified academic transcripts', quantity: 4 }
  ],
  'IT': [
    { itemType: 'Computer Equipment', description: 'Laptops, monitors, keyboards', quantity: 2 },
    { itemType: 'Software Licenses', description: 'Licenses for office and development software', quantity: 5 },
    { itemType: 'Network Equipment', description: 'Router, cables, switches', quantity: 3 },
    { itemType: 'IT Accessories', description: 'Mice, USB drives, adapters', quantity: 8 }
  ],
  'ORIC': [
    { itemType: 'Research Equipment', description: 'Specialized research instruments', quantity: 1 },
    { itemType: 'Research Samples', description: 'Lab samples and specimens', quantity: 6 },
    { itemType: 'Research Data', description: 'Project files and research data', quantity: 10 },
    { itemType: 'Patent Documents', description: 'Patent applications and filings', quantity: 2 }
  ],
  'Admin': [
    { itemType: 'Administrative Forms', description: 'Official forms and applications', quantity: 20 },
    { itemType: 'Office Supplies', description: 'Stationery, pens, paper, folders', quantity: 15 },
    { itemType: 'Official Seals', description: 'Stamps and office seals', quantity: 1 },
    { itemType: 'Documentation', description: 'Official administrative documents', quantity: 5 }
  ],
  'Warden': [
    { itemType: 'Building Keys', description: 'Keys to office and facility doors', quantity: 3 },
    { itemType: 'Access Cards', description: 'ID cards and access passes', quantity: 2 },
    { itemType: 'Security Equipment', description: 'Security badges and passes', quantity: 1 },
    { itemType: 'Facility Documents', description: 'Facility access logs and forms', quantity: 4 }
  ],
  'HOD': [
    { itemType: 'Department Records', description: 'Departmental administrative files', quantity: 8 },
    { itemType: 'Committee Documents', description: 'Meeting minutes and committee records', quantity: 5 },
    { itemType: 'Budget Files', description: 'Department budget documents', quantity: 3 },
    { itemType: 'Academic Documents', description: 'Course outlines and syllabi', quantity: 6 }
  ],
  'Dean': [
    { itemType: 'Official Certificates', description: 'Degree and honor certificates', quantity: 5 },
    { itemType: 'Institutional Documents', description: 'Official institution records', quantity: 4 },
    { itemType: 'Seals and Stamps', description: 'Official seals for certificates', quantity: 2 },
    { itemType: 'Convocation Records', description: 'Convocation and graduation files', quantity: 3 }
  ]
};

async function createBulkIssues() {
  try {
    await mongoose.connect(mongoUrl, { 
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000 
    });
    console.log('✅ Connected to MongoDB\n');

    // Array to hold all issues to be created
    const issuesToCreate = [];

    // Generate issues for each faculty
    facultyIds.forEach(facultyId => {
      // For each department
      Object.entries(departmentItems).forEach(([department, items]) => {
        // Randomly select 1-3 items from the department
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedItems = [];
        const usedIndexes = new Set();

        for (let i = 0; i < numItems; i++) {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * items.length);
          } while (usedIndexes.has(randomIndex));
          
          usedIndexes.add(randomIndex);
          selectedItems.push(items[randomIndex]);
        }

        // Create issue records for each item
        selectedItems.forEach((item, index) => {
          const issueDate = new Date();
          issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days

          const dueDate = new Date(issueDate);
          dueDate.setDate(dueDate.getDate() + 30); // 30 days from issue date

          issuesToCreate.push({
            facultyId: facultyId,
            facultyName: `Faculty Member ${facultyId}`,
            facultyEmail: `faculty${facultyId}@riphah.edu.pk`,
            departmentName: department,
            itemType: item.itemType,
            description: item.description,
            quantity: item.quantity,
            dueDate: dueDate,
            issueDate: issueDate,
            status: 'Issued',
            issueReferenceNumber: `ISS-${facultyId}-${department}-${Date.now()}-${index}`,
            notes: `Issued to ${facultyId} - Pending return from ${department}`
          });
        });
      });
    });

    console.log(`📊 Total issues to create: ${issuesToCreate.length}`);
    console.log(`👥 Faculty members: ${facultyIds.length}`);
    console.log(`🏢 Departments: ${Object.keys(departmentItems).length}\n`);

    // Delete existing issues for these faculty members (optional - comment out if you want to keep existing)
    console.log('🔄 Clearing existing issues for these faculty members...');
    await Issue.deleteMany({ facultyId: { $in: facultyIds } });
    console.log('✅ Cleared existing issues\n');

    // Insert all issues
    console.log('📝 Creating bulk issues...');
    const result = await Issue.insertMany(issuesToCreate);
    console.log(`✅ Successfully created ${result.length} issues\n`);

    // Show summary by department
    console.log('📈 Summary by Department:');
    console.log('─'.repeat(50));
    
    const departmentStats = {};
    result.forEach(issue => {
      if (!departmentStats[issue.departmentName]) {
        departmentStats[issue.departmentName] = 0;
      }
      departmentStats[issue.departmentName]++;
    });

    Object.entries(departmentStats).sort().forEach(([dept, count]) => {
      console.log(`   ${dept.padEnd(15)} : ${count.toString().padStart(4)} issues`);
    });

    console.log('─'.repeat(50));
    console.log(`\n📍 Summary by Faculty:`);
    console.log('─'.repeat(50));
    
    const facultyStats = {};
    result.forEach(issue => {
      if (!facultyStats[issue.facultyId]) {
        facultyStats[issue.facultyId] = 0;
      }
      facultyStats[issue.facultyId]++;
    });

    console.log(`   Total unique faculty: ${Object.keys(facultyStats).length}`);
    console.log(`   Issues per faculty: ${Math.round(result.length / facultyIds.length)}`);
    const issueRange = Object.values(facultyStats);
    console.log(`   Min issues per faculty: ${Math.min(...issueRange)}`);
    console.log(`   Max issues per faculty: ${Math.max(...issueRange)}`);

    console.log('\n✨ Bulk issues created successfully!');
    console.log('   The system will now show "Blocked" status for these faculty');
    console.log('   until they complete the return/clearance process.\n');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error creating bulk issues:', err.message);
    if (err.code === 11000) {
      console.error('   Duplicate key error - some issues may have already been created');
    }
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
createBulkIssues();
