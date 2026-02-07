/**
 * CERTIFICATE SERVICE
 * Generates QR code, PDF certificate, and sends email
 * Called ONLY when ALL 12 departments are Approved
 */

const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Ensure certificates directory exists
const CERT_DIR = path.join(__dirname, '..', 'certificates');
if (!fs.existsSync(CERT_DIR)) {
  fs.mkdirSync(CERT_DIR, { recursive: true });
}

/**
 * Generate QR code as data URL
 */
async function generateQR(data) {
  return QRCode.toDataURL(JSON.stringify(data), { width: 200, margin: 1 });
}

/**
 * Generate PDF clearance certificate
 * @param {Object} opts
 * @param {string} opts.clearanceId
 * @param {string} opts.facultyName
 * @param {string} opts.facultyId
 * @param {string} opts.facultyEmail
 * @param {Array}  opts.phases - [{ name, status, remarks }]
 * @param {string} opts.qrDataUrl - base64 QR image
 * @returns {string} path to saved PDF
 */
function generateCertificatePDF(opts) {
  return new Promise((resolve, reject) => {
    const fileName = `clearance_${opts.clearanceId}.pdf`;
    const filePath = path.join(CERT_DIR, fileName);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // --- Header ---
    doc.fontSize(22).font('Helvetica-Bold')
      .text('RIPHAH INTERNATIONAL UNIVERSITY', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(16).font('Helvetica')
      .text('Faculty Clearance Certificate', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#2563eb');
    doc.moveDown(1);

    // --- Faculty Info ---
    doc.fontSize(12).font('Helvetica-Bold').text('Faculty Information');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(11);
    doc.text(`Name:  ${opts.facultyName}`);
    doc.text(`ID:    ${opts.facultyId}`);
    doc.text(`Email: ${opts.facultyEmail}`);
    doc.text(`Date:  ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
    doc.moveDown(1);

    // --- Department Status Table ---
    doc.fontSize(12).font('Helvetica-Bold').text('Department Clearance Status');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1 = 55, col2 = 200, col3 = 350;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('#', col1, tableTop);
    doc.text('Department', col1 + 20, tableTop);
    doc.text('Status', col2 + 30, tableTop);
    doc.text('Remarks', col3, tableTop);
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#d1d5db');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(10);
    opts.phases.forEach((p, i) => {
      const y = doc.y;
      doc.text(`${i + 1}`, col1, y);
      doc.text(p.name, col1 + 20, y);
      doc.text(p.status === 'Approved' ? '✓ Approved' : '✗ Rejected', col2 + 30, y);
      doc.text(p.remarks || '-', col3, y, { width: 190 });
      doc.moveDown(0.6);
    });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#2563eb');
    doc.moveDown(1);

    // --- Overall Status ---
    doc.fontSize(14).font('Helvetica-Bold')
      .fillColor('#059669')
      .text('OVERALL STATUS: CLEARED', { align: 'center' });
    doc.moveDown(1.5);

    // --- QR Code ---
    if (opts.qrDataUrl) {
      const qrBuffer = Buffer.from(opts.qrDataUrl.split(',')[1], 'base64');
      doc.image(qrBuffer, (doc.page.width - 120) / 2, doc.y, { width: 120 });
      doc.moveDown(8);
      doc.fontSize(9).font('Helvetica').fillColor('#666')
        .text('Scan QR code to verify certificate', { align: 'center' });
    }

    // --- Footer ---
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#999')
      .text(`Certificate ID: ${opts.clearanceId}`, { align: 'center' });
    doc.text('This is a system-generated certificate. No signature required.', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

/**
 * Send clearance certificate email
 */
async function sendCertificateEmail(opts) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: opts.facultyEmail,
    subject: 'Faculty Clearance Certificate - Riphah International University',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#2563eb;text-align:center;">Riphah International University</h2>
        <h3 style="text-align:center;">Faculty Clearance Certificate</h3>
        <hr style="border:1px solid #e5e7eb;">
        <p>Dear <strong>${opts.facultyName}</strong>,</p>
        <p>Congratulations! Your clearance has been <strong style="color:#059669;">APPROVED</strong> by all 12 departments.</p>
        <p>Your certificate is attached to this email as a PDF document.</p>
        <p style="background:#f0fdf4;padding:12px;border-radius:6px;border:1px solid #bbf7d0;">
          <strong>Certificate ID:</strong> ${opts.clearanceId}<br>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}
        </p>
        <p style="color:#666;font-size:12px;">This is an automated email from the Faculty Clearance System.</p>
      </div>
    `,
    attachments: opts.pdfPath ? [{
      filename: path.basename(opts.pdfPath),
      path: opts.pdfPath
    }] : []
  };

  await transporter.sendMail(mailOptions);
  console.log(`   📧 Certificate emailed to ${opts.facultyEmail}`);
}

/**
 * Full pipeline: QR → PDF → Email
 * Called when all 12 departments are Approved
 */
async function generateAndSendCertificate(clearanceRequest) {
  const clearanceId = String(clearanceRequest._id);
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificate-view/${clearanceId}`;

  // 1. Generate QR
  const qrDataUrl = await generateQR({
    clearanceId,
    facultyId: clearanceRequest.queryId || clearanceRequest.facultyId,
    facultyName: clearanceRequest.facultyName,
    verificationUrl,
    status: 'CLEARED',
    date: new Date().toISOString()
  });

  // 2. Generate PDF
  const pdfPath = await generateCertificatePDF({
    clearanceId,
    facultyName: clearanceRequest.facultyName,
    facultyId: clearanceRequest.queryId || clearanceRequest.facultyId,
    facultyEmail: clearanceRequest.facultyEmail,
    phases: clearanceRequest.phases,
    qrDataUrl
  });

  // 3. Send Email
  try {
    await sendCertificateEmail({
      facultyName: clearanceRequest.facultyName,
      facultyEmail: clearanceRequest.facultyEmail,
      clearanceId,
      pdfPath
    });
  } catch (emailErr) {
    console.error('   ⚠️ Email sending failed (certificate still saved):', emailErr.message);
  }

  return { qrDataUrl, pdfPath, verificationUrl };
}

module.exports = { generateAndSendCertificate, generateQR, generateCertificatePDF };
