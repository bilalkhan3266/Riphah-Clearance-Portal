# Email Configuration Guide

The Faculty Clearance System can send clearance certificates via email. To enable this feature, you need to configure email credentials in the `.env` file.

## Prerequisites

1. **Gmail Account** - We recommend using Gmail with App Passwords
2. **.env file** - Located in `backend/.env`

## Step-by-Step Configuration (Gmail)

### 1. Enable 2-Factor Authentication on Gmail
1. Go to https://myaccount.google.com/
2. Click "Security" in the left sidebar
3. Scroll to "How you sign in to Google"
4. Click "2-Step Verification" and follow the setup

### 2. Create an App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Windows PC" (or your OS) as the device
4. Click "Generate"
5. Google will show a 16-character password - **Copy this password**

### 3. Configure the .env File

Open `backend/.env` and update the email settings:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=Faculty Clearance System <noreply@riphah.edu.pk>
FRONTEND_URL=http://localhost:3000
```

**Replace these values:**
- `EMAIL_USER`: Your actual Gmail address (e.g., admin@gmail.com)
- `EMAIL_PASSWORD`: The 16-character App Password from Step 2
- `FRONTEND_URL`: Your frontend URL (localhost:3000 for development, production URL for deployment)

### 4. Restart the Backend Server

After updating `.env`, restart your backend server:

```bash
cd backend
node server.js
```

You should see on startup:
```
✅ Email credentials are configured
```

## Troubleshooting

### Error: Email credentials not properly configured

**Issue**: Server shows warning about email credentials

**Solution**: Check that you have:
1. A valid Gmail address in `EMAIL_USER`
2. A 16-character App Password in `EMAIL_PASSWORD` (not your Gmail password)
3. Restarted the server after changing `.env`

### Error: SMTP Connection Failed

**Issue**: Server can connect to MongoDB but not to Gmail SMTP

**Solution**:
1. Verify 2-Factor Authentication is enabled
2. Verify the App Password is correct (remove spaces when pasting)
3. Check if Gmail is blocking the connection - allow "Less secure apps" or use a different email provider

### Certificate Email Not Sending (500 Error)

**Issue**: Getting a 500 error when clicking "Send Certificate"

**Solutions**:
1. Check server logs for the exact error
2. Verify email is configured (check startup logs)
3. Make sure the faculty member's clearance is complete (all phases approved)
4. Check that QR code was generated successfully

## Alternative Email Providers

You can use other SMTP providers instead of Gmail:

### Outlook/Office 365
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Custom SMTP Server
```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASSWORD=your-password
```

## Testing Email Configuration

### Using the Dashboard
1. Log in as a faculty member
2. Complete all departmental clearances
3. Click "Send Certificate to Email" button
4. Check if email arrives

### Using Backend Logs
Check the backend console for detailed email sending logs:
- ✅ means email sent successfully
- ❌ means there was an error (check the error message)

## Manual Certificate Download

If email is not configured or not working:
1. Faculty can still download their certificate from the dashboard
2. They can print it for official records
3. The certificate includes the QR code for verification

## Security Notes

⚠️ **Important**:
- Never commit `.env` to version control
- Keep your App Password secret
- Don't use your main Gmail password - always use App Password
- For production, consider using environment variables instead of `.env` file

---

For further assistance, contact the system administrator.
