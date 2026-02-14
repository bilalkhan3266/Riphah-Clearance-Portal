const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

/**
 * Generate QR Code for clearance certificate
 * @param {Object} data - Data to encode in QR
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
exports.generateQRCode = async (data) => {
  try {
    const qrData = {
      facultyId: data.facultyId,
      clearanceId: data.clearanceId,
      verificationUrl: data.verificationUrl,
      timestamp: Date.now()
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      width: 300,
      margin: 1,
      color: {
        dark: '#000',
        light: '#FFF'
      }
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR Code file
 * @param {Object} data - Data to encode in QR
 * @param {string} filename - Output filename
 * @returns {Promise<string>} - File path
 */
exports.generateQRCodeFile = async (data, filename) => {
  try {
    const uploadsDir = path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads/qr-codes');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);

    const qrData = {
      facultyId: data.facultyId,
      clearanceId: data.clearanceId,
      verificationUrl: data.verificationUrl,
      timestamp: Date.now()
    };

    await QRCode.toFile(filepath, JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000',
        light: '#FFF'
      }
    });

    return filepath;
  } catch (error) {
    console.error('Error generating QR code file:', error);
    throw new Error('Failed to generate QR code file');
  }
};

/**
 * Verify QR Code Data
 * @param {string} qrData - QR code data string
 * @returns {Object} - Parsed data
 */
exports.verifyQRCodeData = (qrData) => {
  try {
    return JSON.parse(qrData);
  } catch (error) {
    throw new Error('Invalid QR code data');
  }
};
