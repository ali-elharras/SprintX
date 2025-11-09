const QRCode = require('qrcode');
const crypto = require('crypto');

class QRCodeService {
  /**
   * Generate a unique verification token for a visitor
   */
  generateVerificationToken(visitorEmail, vendorId, eventId, applicationType) {
    const data = `${visitorEmail}-${vendorId}-${eventId}-${applicationType}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate QR code as base64 data URL
   * @param {Object} data - Data to encode in QR code
   * @returns {Promise<string>} Base64 data URL of QR code
   */
  async generateQRCode(data) {
    try {
      const qrData = JSON.stringify(data);
      
      // Generate QR code as data URL (base64)
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR codes for all visitors
   * @param {Array} visitors - Array of visitor emails
   * @param {Object} applicationData - Application details
   * @returns {Promise<Array>} Array of visitor data with QR codes
   */
  async generateVisitorQRCodes(visitors, applicationData) {
    const { vendorId, eventId, eventName, applicationType, applicationId } = applicationData;

    const visitorQRCodes = await Promise.all(
      visitors.map(async (visitorEmail, index) => {
        // Generate unique verification token
        const verificationToken = this.generateVerificationToken(
          visitorEmail,
          vendorId,
          eventId || applicationId,
          applicationType
        );

        // Data to encode in QR code
        const qrData = {
          visitorEmail,
          vendorId,
          eventId: eventId || applicationId,
          eventName,
          applicationType,
          verificationToken,
          visitorNumber: index + 1,
          generatedAt: new Date().toISOString(),
        };

        // Generate QR code
        const qrCodeDataURL = await this.generateQRCode(qrData);

        return {
          email: visitorEmail,
          verificationToken,
          qrCodeDataURL,
          visitorNumber: index + 1,
        };
      })
    );

    return visitorQRCodes;
  }

  /**
   * Verify QR code data
   * @param {string} qrDataString - QR code data as JSON string
   * @returns {Object} Parsed and validated QR data
   */
  verifyQRCode(qrDataString) {
    try {
      const qrData = JSON.parse(qrDataString);
      
      // Validate required fields
      const requiredFields = ['visitorEmail', 'vendorId', 'eventId', 'verificationToken'];
      for (const field of requiredFields) {
        if (!qrData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return {
        valid: true,
        data: qrData,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

module.exports = new QRCodeService();
