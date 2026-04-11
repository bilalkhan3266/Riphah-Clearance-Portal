# Faculty Clearance System - Print & Email Certificate Implementation

## Overview
Fixed the faculty dashboard print page and implemented automatic email certificate system when clearance is approved by the Dean.

## Features Implemented

### 1. **Improved Print Functionality**
- Professional certificate design with proper formatting
- QR code displays in print view for verification
- All departments listed in a clean grid format
- Sidebar is hidden in print view
- Proper page breaks and spacing
- Faculty information and clearance status clearly displayed

### 2. **Automatic Email Notification**
When the Dean approves clearance (final approval), the system automatically sends:
- Professional HTML email with formatted certificate
- QR code embedded in the email (as attachment)
- Faculty member details
- All departments cleared status
- Cleared date and time

### 3. **Manual Certificate Resend**
Faculty members can manually resend the certificate email using the "Send to Email" button on the certificate.

### 4. **QR Code Display**
- QR codes are now displayed on:
  - Faculty dashboard certificate section
  - Printed certificate
  - Email certificate

## Backend Changes

### New File: `/backend/utils/emailService.js`
Email utility service with two main functions:

1. **`sendClearanceCertificateEmail(facultyEmail, facultyName, qrCodeDataUrl, clearedAt)`**
   - Sends the clearance certificate via email
   - Includes QR code attachment
   - Professional HTML template with Riphah branding
   - Automatic trigger: When all departments approve (Dean approval)

2. **`sendRejectionEmail(facultyEmail, facultyName, department, remarks)`**
   - Sends rejection notification to faculty
   - Includes remarks from rejecting department
   - Instructions to resubmit

### Updated: `/backend/routes/clearanceRoutes.js`

#### Approval Endpoint (`POST /clearance-requests/:facultyId/approve`)
- Now sends automatic email notification when **fully cleared**
- Includes QR code in email
- Email sent after all departments approve

#### Rejection Endpoint (`POST /clearance-requests/:facultyId/reject`)
- Sends rejection email to faculty
- Includes rejection remarks and instructions
- Non-blocking error handling

#### New Endpoint: `POST /api/send-certificate`
- Allows faculty to manually resend certificate
- Validates clearance status before sending
- Requires valid JWT token
- Returns success/error message

### Updated: `/backend/server.js`

#### GET `/api/clearance-status`
Enhanced response to include:
- `qr_code` - QR code data URL
- `overall_status` - Overall clearance status (In Progress/Cleared)
- `cleared_at` - Date when cleared
- `current_phase` - Current phase in process
- `faculty_name` - Faculty member name
- `faculty_email` - Faculty email
- `request_id` - Request ID

## Frontend Changes

### Updated: `/frontend/src/components/Faculty/Dashboard.js`

#### New State Variables
```javascript
const [qrCode, setQrCode] = useState(null);
const [sendingEmail, setSendingEmail] = useState(false);
const [emailStatus, setEmailStatus] = useState("");
```

#### Updated `fetchClearanceStatus()`
- Extracts QR code from API response
- Stores QR code in state for display

#### New Function: `handleSendCertificateEmail()`
- Makes POST request to `/api/send-certificate`
- Shows loading state during email send
- Displays success/error messages
- Handles errors gracefully

#### Updated Certificate Section
Replaced old placeholder with professional certificate design:
- Certificate header with title and subtitle
- Faculty information display
- QR code section with actual QR code image
- All departments listed in a clean grid
- Professional action buttons (Print & Send Email)
- Email status display with animations

### Updated: `/frontend/src/components/Faculty/Dashboard.css`

#### New Certificate Styles
- `.fd-certificate` - Main container
- `.cert-container` - Certificate card styling
- `.cert-header` - Header section with border
- `.cert-content` - Flex layout for info and QR
- `.cert-info` - Faculty information section
- `.cert-qr-section` - QR code display area
- `.qr-code-actual` - QR code image styling
- `.cert-departments` - All cleared departments grid
- `.dept-chip` - Individual department badge
- `.cert-actions` - Action buttons (Print, Email)
- `.btn-large` - Large button styling
- `.email-status-alert` - Email status message display

#### Improved Print CSS
Comprehensive `@media print` section includes:
- Hide sidebar, navigation, and unnecessary UI
- Professional certificate layout
- QR code display in print
- Department grid in print format
- Proper page breaks and margins
- Font sizes optimized for printing
- Colors preserved for important elements
- Print-ready HTML structure

## Email Configuration

### Environment Variables (Backend .env)
```
EMAIL_HOST=smtp.gmail.com        # SMTP server
EMAIL_PORT=587                   # SMTP port
EMAIL_USER=your-email@gmail.com # Sender email
EMAIL_PASSWORD=app-password     # Gmail app password
EMAIL_FROM=noreply@riphah.edu.pk # From address
```

### Note
- Uses Nodemailer (already installed)
- Supports Gmail, Office365, or any SMTP server
- QR code sent as attachment in email

## User Flow

### For Faculty:
1. Submit clearance request
2. Departments approve in phases
3. When **all departments approve**:
   - ✅ System generates QR code
   - ✅ System sends automatic email with certificate
   - ✅ Faculty sees "Clearance Complete" on dashboard
4. Faculty can:
   - Print certificate with QR code
   - Manually resend certificate via email button
   - View all departments cleared

### For Department Staff:
- Approve clearance → System creates message notification (from previous fix)
- When final approval (Dean) → System sends automatic email to faculty

## Testing Checklist

- [ ] Department approves clearance → Faculty sees notification message
- [ ] Dean approves final clearance → Automatic email sent with QR code
- [ ] Print button → Generates PDF with certificate and QR code
- [ ] Email button → Sends certificate to faculty email
- [ ] QR code displays correctly in UI, print, and email
- [ ] All 12 departments listed in certificate
- [ ] Print preview shows clean, professional layout
- [ ] Email template renders correctly in different email clients
- [ ] Error handling works (missing email config, SMTP errors)

## Files Modified/Created

### Created:
- `backend/utils/emailService.js` - Email service utility

### Modified:
- `backend/routes/clearanceRoutes.js` - Added email sending and new endpoint
- `backend/server.js` - Enhanced clearance-status endpoint
- `frontend/src/components/Faculty/Dashboard.js` - Updated certificate section
- `frontend/src/components/Faculty/Dashboard.css` - New certificate and print styles

## Dependencies
All required packages already installed:
- `nodemailer` - Email sending
- `qrcode` - QR code generation
- `axios` - API requests (already used)

## Future Enhancements
- PDF generation instead of browser print
- SMS notifications
- Certificate archiving/history
- Bulk email resend for multiple faculty
- Custom email templates per department
