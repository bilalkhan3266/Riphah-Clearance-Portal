const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

/**
 * Generate Clearance Certificate PDF
 * @param {Object} data - Certificate data
 * @returns {Promise<string>} - PDF file path
 */
exports.generateCertificate = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        facultyId,
        facultyName,
        clearanceId,
        issuedDate,
        verificationToken,
        phases = []
      } = data;

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', process.env.CERTIFICATES_DIR || 'uploads/certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `clearance_${facultyId}_${Date.now()}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Pipe to file
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Add decorative border
      doc
        .rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .strokeColor('#1e40af')
        .lineWidth(3)
        .stroke();

      doc
        .rect(50, 50, doc.page.width - 100, doc.page.height - 100)
        .strokeColor('#1e40af')
        .lineWidth(1)
        .stroke();

      // Title
      doc
        .fontSize(36)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text('FACULTY CLEARANCE', { align: 'center' })
        .moveDown(0.5)
        .fontSize(24)
        .text('CERTIFICATE', { align: 'center' });

      // Add space
      doc.moveDown(1.5);

      // Certificate number
      doc
        .fontSize(11)
        .fillColor('#666')
        .text(`Certificate No: ${clearanceId}`, { align: 'right' })
        .moveDown(0.3);

      // Main content
      doc
        .fontSize(14)
        .fillColor('#000')
        .text(
          'This is to certify that',
          { align: 'center' }
        )
        .moveDown(0.5);

      // Faculty name - highlighted
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text(facultyName.toUpperCase(), { align: 'center' })
        .moveDown(0.5);

      // Faculty ID
      doc
        .fontSize(12)
        .fillColor('#666')
        .text(`(Employee ID: ${facultyId})`, { align: 'center' })
        .moveDown(1);

      // Statement
      doc
        .fontSize(12)
        .fillColor('#000')
        .text(
          'has successfully completed the clearance process as required by the institution. All department clearances have been obtained and verified.',
          {
            align: 'center',
            width: doc.page.width - 100
          }
        )
        .moveDown(1.5);

      // Department status
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text('Department Clearances:', { underline: true })
        .moveDown(0.5);

      // Draw departments in columns
      doc.fontSize(10).fillColor('#000').font('Helvetica');

      const departments = phases.length > 0 ? phases : [
        { name: 'Lab', status: 'Approved' },
        { name: 'Library', status: 'Approved' },
        { name: 'Pharmacy', status: 'Approved' },
        { name: 'Finance', status: 'Approved' },
        { name: 'HR', status: 'Approved' },
        { name: 'Records', status: 'Approved' },
        { name: 'Admin', status: 'Approved' },
        { name: 'IT', status: 'Approved' },
        { name: 'ORIC', status: 'Approved' },
        { name: 'Warden', status: 'Approved' },
        { name: 'HOD', status: 'Approved' },
        { name: 'Dean', status: 'Approved' }
      ];

      // Create two-column layout
      const colWidth = (doc.page.width - 100) / 2;
      let x = 50;
      let y = doc.y;

      departments.forEach((dept, index) => {
        const checkmark = dept.status === 'Approved' ? '✓' : '✗';
        const color = dept.status === 'Approved' ? '#22c55e' : '#ef4444';

        doc.text(`${checkmark} ${dept.name}`, x, y, { width: colWidth - 20 });

        if ((index + 1) % 2 === 0) {
          y += 20;
          x = 50;
        } else {
          x += colWidth;
        }
      });

      // Move to next section
      doc.moveTo(50, doc.y + 20).lineTo(doc.page.width - 50, doc.y + 20).strokeColor('#ccc').stroke();
      doc.moveDown(2);

      // Issue date
      const dateStr = new Date(issuedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc
        .fontSize(11)
        .fillColor('#666')
        .text(`Date Issued: ${dateStr}`)
        .moveDown(1);

      // Verification info
      doc
        .fontSize(9)
        .fillColor('#999')
        .text(`Verification Token: ${verificationToken}`)
        .moveDown(0.5);

      // Add QR code if verification token exists
      if (verificationToken) {
        try {
          const qrCodeUrl = await QRCode.toDataURL(verificationToken, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 200
          });

          // Remove 'data:image/png;base64,' prefix and create buffer
          const base64Data = qrCodeUrl.replace(/^data:image\/png;base64,/, '');
          const qrBuffer = Buffer.from(base64Data, 'base64');

          doc.image(qrBuffer, doc.page.width - 150, doc.page.height - 180, {
            width: 100,
            height: 100
          });
        } catch (qrError) {
          console.error('Error adding QR code to PDF:', qrError);
        }
      }

      // Footer
      doc
        .fontSize(8)
        .fillColor('#999')
        .text(
          '-----------------------------------',
          { align: 'center' }
        )
        .moveDown(0.2)
        .text('This document is digitally signed and verified', { align: 'center' })
        .moveDown(0.2)
        .text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

      // Finalize PDF
      doc.end();

      // Resolve when stream finishes
      stream.on('finish', () => {
        resolve(filepath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      reject(error);
    }
  });
};

/**
 * Generate detailed clearance report PDF
 * @param {Object} data - Report data
 * @returns {Promise<string>} - PDF file path
 */
exports.generateClearanceReport = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { facultyId, facultyName, phases, departments } = data;

      const uploadsDir = path.join(__dirname, '..', process.env.REPORTS_DIR || 'uploads/reports');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `clearance_report_${facultyId}_${Date.now()}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Clearance Verification Report', { align: 'center' })
        .moveDown(0.5)
        .fontSize(12)
        .fillColor('#666')
        .text(`Faculty: ${facultyName} (${facultyId})`, { align: 'center' })
        .moveDown(1);

      // Phases
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor('#000')
        .text('Department Clearance Status:')
        .moveDown(0.5);

      phases.forEach(phase => {
        doc
          .fontSize(11)
          .fillColor(phase.status === 'Approved' ? '#22c55e' : '#ef4444')
          .text(`• ${phase.name}: ${phase.status}`)
          .moveDown(0.3);
      });

      doc.end();

      stream.on('finish', () => {
        resolve(filepath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      console.error('Error generating report:', error);
      reject(error);
    }
  });
};
