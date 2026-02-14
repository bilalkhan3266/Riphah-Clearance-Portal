const nodemailer = require('nodemailer');

// Check if email is properly configured
function isEmailConfigured() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD;
  
  return emailUser && emailUser !== 'your-email@gmail.com' && 
         emailPass && emailPass !== 'your-app-password';
}

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

/**
 * Send clearance certificate email
 * @param {string} facultyEmail - Faculty member email
 * @param {string} facultyName - Faculty member name
 * @param {string} qrCodeDataUrl - QR code as data URL
 * @param {Date} clearedAt - Date when clearance was completed
 * @param {string} certificateId - Clearance request ID for certificate link
 */
async function sendClearanceCertificateEmail(facultyEmail, facultyName, qrCodeDataUrl, clearedAt, certificateId) {
  try {
    const clearedDate = new Date(clearedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Certificate link
    const certificateLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificate-view/${certificateId}`;
    const directDownloadLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificate/${certificateId}/download`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 40px;
          }
          .certificate-box {
            border: 3px solid #667eea;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            background: linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%);
            margin: 30px 0;
          }
          .certificate-title {
            font-size: 24px;
            color: #667eea;
            font-weight: 700;
            margin: 0 0 20px 0;
          }
          .faculty-info {
            margin: 30px 0;
            font-size: 16px;
          }
          .faculty-info p {
            margin: 10px 0;
            color: #333;
          }
          .info-label {
            font-weight: 600;
            color: #667eea;
          }
          .qr-section {
            margin: 40px 0;
            text-align: center;
          }
          .qr-code {
            max-width: 250px;
            height: auto;
            border: 2px solid #667eea;
            padding: 10px;
            background: white;
            border-radius: 8px;
            display: inline-block;
          }
          .cleared-date {
            font-size: 14px;
            color: #666;
            margin-top: 20px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .btn {
            display: inline-block;
            padding: 12px 30px;
            margin: 0 10px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .btn-secondary {
            background: #f0f0f0;
            color: #333;
            border: 2px solid #667eea;
          }
          .btn-secondary:hover {
            background: #667eea;
            color: white;
          }
          .footer {
            background: #f8f9ff;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
            font-size: 13px;
            color: #666;
          }
          .success-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin: 20px 0;
          }
          .note {
            background: #fff3cd;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
            color: #856404;
            font-size: 14px;
          }
          .departments-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 20px 0;
            text-align: left;
          }
          .dept-item {
            background: #f0f0f0;
            padding: 10px;
            border-radius: 4px;
            font-size: 13px;
          }
          .dept-item:before {
            content: '✓ ';
            color: #10b981;
            font-weight: 700;
            margin-right: 5px;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .container {
              box-shadow: none;
              border-radius: 0;
            }
            .footer {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Clearance Certificate</h1>
            <p>Riphah International University</p>
          </div>

          <div class="content">
            <div class="certificate-box">
              <div class="certificate-title">Clearance Approved</div>
              
              <div class="success-badge">✓ ALL DEPARTMENTS CLEARED</div>

              <div class="faculty-info">
                <p><span class="info-label">Faculty Member:</span><br>${facultyName}</p>
              </div>

              <div class="button-container">
                <a href="${certificateLink}" class="btn btn-primary">📄 View Full Certificate</a>
              </div>

              <div class="qr-section">
                <p style="margin: 0 0 15px 0; color: #666; font-weight: 600;">Verification QR Code:</p>
                ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code">` : '<p style="color: #999;">QR Code unavailable</p>'}
                <div class="cleared-date">Cleared on: ${clearedDate}</div>
              </div>

              <div class="note">
                📋 <strong>Important:</strong> This certificate confirms that you have been cleared by all departments. Please keep this email for your records. The QR code above serves as verification of your clearance status.
              </div>
            </div>

            <h3 style="color: #333; margin-top: 30px;">Clearance Summary:</h3>
            <p style="color: #666; margin-bottom: 15px;">All departments have approved your clearance:</p>
            <div class="departments-grid">
              <div class="dept-item">Lab</div>
              <div class="dept-item">Library</div>
              <div class="dept-item">Pharmacy</div>
              <div class="dept-item">Finance</div>
              <div class="dept-item">HR</div>
              <div class="dept-item">Records</div>
              <div class="dept-item">IT</div>
              <div class="dept-item">Admin</div>
              <div class="dept-item">ORIC</div>
              <div class="dept-item">Warden</div>
              <div class="dept-item">HOD</div>
              <div class="dept-item">Dean</div>
            </div>

            <h3 style="color: #333; margin-top: 30px;">Next Steps:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Your clearance status has been updated across all university departments</li>
              <li>You can download and print your certificate for official records</li>
              <li>Share the QR code with any department that requires verification</li>
              <li>If you need additional copies, contact the Dean's Office</li>
              <li>For any queries, reply to this email or contact <strong>faculty.clearance@riphah.edu.pk</strong></li>
            </ul>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2196f3;">
              <p style="margin: 0; color: #1565c0; font-weight: 600;">💡 Tip:</p>
              <p style="margin: 10px 0 0 0; color: #555;">Save this email and the QR code for quick verification purposes. You can always visit the certificate link above to view your full clearance status.</p>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0;">© 2026 Riphah International University. All rights reserved.</p>
            <p style="margin: 10px 0 0 0;">Faculty Clearance System | Automated Message</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Faculty Clearance System <noreply@riphah.edu.pk>',
      to: facultyEmail,
      subject: `✅ Your Faculty Clearance Certificate - ${facultyName}`,
      html: htmlContent,
      attachments: []
    };

    // Try to attach QR code if available
    if (qrCodeDataUrl) {
      try {
        // Check if it's a data URL with base64 content
        if (qrCodeDataUrl.includes('base64,')) {
          const base64Data = qrCodeDataUrl.split('base64,')[1];
          if (base64Data) {
            mailOptions.attachments.push({
              filename: 'clearance-qr-code.png',
              cid: 'qr-code-unique',
              data: Buffer.from(base64Data, 'base64'),
              contentType: 'image/png'
            });
          }
        }
      } catch (attachErr) {
        console.warn('⚠️ Could not attach QR code image:', attachErr.message);
        // Continue sending email without attachment
      }
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${facultyEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email to ${facultyEmail}:`, error.message);
    console.error('Full Error:', error);
    return { success: false, error: error.message || 'Unknown email error' };
  }
}

/**
 * Send rejection notification email
 * @param {string} facultyEmail - Faculty member email
 * @param {string} facultyName - Faculty member name
 * @param {string} department - Department that rejected
 * @param {string} remarks - Rejection remarks
 */
async function sendRejectionEmail(facultyEmail, facultyName, department, remarks) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .alert-box {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .alert-box h3 {
            color: #dc2626;
            margin: 0 0 10px 0;
          }
          .remarks-box {
            background: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
          }
          .remarks-title {
            font-weight: 600;
            color: #374151;
            margin: 0 0 10px 0;
          }
          .remarks-content {
            color: #4b5563;
            margin: 0;
            white-space: pre-wrap;
            line-height: 1.6;
          }
          .action-link {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            background: #f9fafb;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Clearance Request Update</h1>
          </div>

          <div class="content">
            <p>Dear ${facultyName},</p>

            <div class="alert-box">
              <h3>Your clearance request has been rejected</h3>
              <p><strong>Department:</strong> ${department}</p>
            </div>

            ${remarks ? `
            <div class="remarks-box">
              <div class="remarks-title">📋 Remarks from ${department}:</div>
              <div class="remarks-content">${remarks}</div>
            </div>
            ` : ''}

            <p>Please review the remarks above carefully. You can resubmit your clearance request from the Faculty Clearance System dashboard once you have addressed the concerns.</p>

            <center>
              <a href="http://localhost:3000/faculty-clearance-status" class="action-link">View Clearance Status</a>
            </center>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">If you have any questions about this decision, please contact the ${department} office or reply to this email.</p>
          </div>

          <div class="footer">
            <p style="margin: 0;">© 2026 Riphah International University. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Faculty Clearance System <noreply@riphah.edu.pk>',
      to: facultyEmail,
      subject: `❌ Clearance Request Rejected - ${department}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Rejection email sent to ${facultyEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending rejection email to ${facultyEmail}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 * @param {string} userEmail - User email
 * @param {string} userName - User name
 * @param {string} resetLink - Password reset link with token
 */
async function sendPasswordResetEmail(userEmail, userName, resetLink) {
  try {
    if (!isEmailConfigured()) {
      console.warn('⚠️ Email service not configured, cannot send reset email');
      return { success: false, error: 'Email service not configured' };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #003366 0%, #00509e 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
          }
          .message {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .reset-button-container {
            text-align: center;
            margin: 40px 0;
          }
          .reset-button {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #003366 0%, #00509e 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 51, 102, 0.4);
          }
          .warning {
            background: #fff3cd;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
            color: #856404;
            font-size: 13px;
            line-height: 1.5;
          }
          .link-container {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            border: 1px solid #e0e0e0;
          }
          .link-label {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
          }
          .link-text {
            color: #0066cc;
            font-family: monospace;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .expiry-notice {
            color: #e74c3c;
            font-weight: 600;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p class="greeting">Hello ${userName},</p>
            
            <p class="message">
              We received a request to reset the password for your Faculty Clearance System account. 
              If you did not make this request, you can ignore this email.
            </p>

            <div class="reset-button-container">
              <a href="${resetLink}" class="reset-button">Reset Your Password</a>
            </div>

            <p class="message">
              Or copy and paste this link in your browser:
            </p>

            <div class="link-container">
              <div class="link-label">Reset Link:</div>
              <div class="link-text">${resetLink}</div>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 8px 0; padding-left: 20px;">
                <li>This link will expire in <strong>24 hours</strong></li>
                <li>Do not share this link with anyone</li>
                <li>If you did not request this, please ignore this email</li>
                <li>Your password will not change unless you click the link above</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>
              <strong>Faculty Clearance System</strong><br>
              Riphah International University<br>
              © 2025 All rights reserved.<br>
              <br>
              <em>This is an automated email. Please do not reply directly to this message.</em>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Password Reset Request - Faculty Clearance System',
      html: htmlContent,
      text: `Hi ${userName},\n\nClick this link to reset your password:\n${resetLink}\n\nThis link expires in 24 hours.\n\nIf you didn't request this, ignore this email.`
    };

    console.log('📧 Sending password reset email to:', userEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending password reset email to ${userEmail}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset code (6-digit) via email
 * @param {string} userEmail - User email
 * @param {string} userName - User name
 * @param {string} resetCode - 6-digit reset code
 */
async function sendPasswordResetCodeEmail(userEmail, userName, resetCode) {
  try {
    if (!isEmailConfigured()) {
      console.warn('⚠️ Email service not configured, cannot send reset code');
      return { success: false, error: 'Email service not configured' };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #003366 0%, #00509e 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
          }
          .code-box {
            background: linear-gradient(135deg, #003366 0%, #00509e 100%);
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .code-label {
            color: white;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            opacity: 0.9;
          }
          .code-display {
            background: white;
            color: #003366;
            font-size: 42px;
            font-weight: 700;
            padding: 20px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            letter-spacing: 8px;
            display: inline-block;
            min-width: 250px;
          }
          .code-expiry {
            color: white;
            font-size: 12px;
            margin-top: 12px;
            opacity: 0.85;
          }
          .message {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            margin: 20px 0;
          }
          .warning {
            background: #fff3cd;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
            color: #856404;
            font-size: 13px;
            line-height: 1.5;
          }
          .warning strong {
            display: block;
            margin-bottom: 8px;
          }
          .warning ul {
            margin: 0;
            padding-left: 20px;
          }
          .warning li {
            margin: 5px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .security-note {
            color: #e74c3c;
            font-weight: 600;
            margin-top: 20px;
            font-size: 13px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Code</h1>
          </div>
          <div class="content">
            <p class="greeting">Hello ${userName},</p>
            
            <p class="message">
              We received a request to reset the password for your Faculty Clearance System account. 
              Use the 6-digit code below to reset your password. This code is valid for 15 minutes.
            </p>

            <div class="code-box">
              <div class="code-label">Your Reset Code</div>
              <div class="code-display">${resetCode}</div>
              <div class="code-expiry">⏰ Valid for 15 minutes</div>
            </div>

            <p class="message">
              <strong>How to use this code:</strong><br>
              1. Go to the password reset page<br>
              2. Enter the 6-digit code above<br>
              3. Create your new password<br>
              4. Log in with your new password
            </p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>Never share this code with anyone</li>
                <li>This code expires in 15 minutes</li>
                <li>If you did not request this, please ignore this email</li>
                <li>Faculty Clearance staff will never ask for this code</li>
                <li>Your password will not change until you submit the code</li>
              </ul>
            </div>

            <p class="message">
              If you did not request this password reset, please ignore this email and your account will remain secure.
            </p>

            <div class="security-note">
              🔒 Keep this email safe until you reset your password.
            </div>
          </div>
          <div class="footer">
            <p>
              <strong>Faculty Clearance System</strong><br>
              Riphah International University<br>
              © 2026 All rights reserved.<br>
              <br>
              <em>This is an automated email. Please do not reply directly to this message.</em>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: `Password Reset Code - Faculty Clearance System`,
      html: htmlContent,
      text: `Your password reset code is: ${resetCode}\n\nThis code is valid for 15 minutes.\n\nIf you did not request this, please ignore this email.`
    };

    console.log('📧 Sending password reset code to:', userEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset code email sent:', info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending password reset code email to ${userEmail}:`, error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendClearanceCertificateEmail,
  sendRejectionEmail,
  sendPasswordResetEmail,
  sendPasswordResetCodeEmail,
  isEmailConfigured
};
