const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    // Check if real email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      // Use real email service when credentials are provided
      console.log("📧 Initializing real email service...");
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify the connection
      this.verifyConnection();
    } else {
      // Fallback to test account for development
      console.log("📧 No email credentials found, using test mode...");
      this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      // Create test account for development
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransporter({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log("📧 Test email account created:");
      console.log("   User:", testAccount.user);
      console.log("   Pass:", testAccount.pass);
    } catch (error) {
      console.error("Failed to create test email account:", error);
      // Fallback to console logging
      this.transporter = null;
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Email service connection verified successfully");
    } catch (error) {
      console.error("❌ Email service connection failed:", error.message);
      console.log(
        "💡 Make sure your email credentials are correct and app passwords are enabled"
      );
    }
  }

  async sendPasswordResetEmail(to, resetToken, userType = "user") {
    console.log(
      `🔄 sendPasswordResetEmail called with: to=${to}, userType=${userType}`
    );
    console.log(`🔧 Transporter status:`, !!this.transporter);
    console.log(`🔧 Environment check - EMAIL_USER:`, !!process.env.EMAIL_USER);
    console.log(
      `🔧 Environment check - EMAIL_PASSWORD:`,
      !!process.env.EMAIL_PASSWORD
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Campus Events Hub" <${process.env.EMAIL_USER}>`, // Use the authenticated Gmail account as sender
      to: to,
      subject: "Password Reset Request - Campus Events Hub",
      html: this.getPasswordResetEmailTemplate(resetUrl, userType),
      text: `
        You requested a password reset for your Campus Events Hub account.
        
        Click the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour for security purposes.
        
        If you didn't request this reset, please ignore this email.
        
        Best regards,
        Campus Events Hub Team
      `,
    };

    try {
      if (!this.transporter) {
        // Fallback to console logging when no transporter available
        console.log(
          "⚠️ No transporter available - falling back to console mode"
        );
        console.log("📧 Password Reset Email (Console Mode):");
        console.log("   To:", to);
        console.log("   Reset URL:", resetUrl);
        console.log("   Subject:", mailOptions.subject);
        return { success: true, messageId: "console-log" };
      }

      console.log(`📧 Sending password reset email to: ${to}`);
      console.log(`📧 Mail options:`, {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      });
      console.log(`🎯 RECIPIENT CHECK - Email should go to: ${to}`);
      console.log(
        `🎯 SENDER CHECK - Email will be sent from: ${mailOptions.from}`
      );

      const info = await this.transporter.sendMail(mailOptions);

      // Check if using real email service or test account
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log("✅ Real email sent successfully!");
        console.log(`   To: ${to}`);
        console.log(`   Message ID: ${info.messageId}`);
      } else {
        console.log("📧 Test email sent:");
        console.log("   Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send password reset email:", error.message);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  getPasswordResetEmailTemplate(resetUrl, userType) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Campus Events Hub</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            background: white;
            padding: 40px 30px;
          }
          .content h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 24px;
          }
          .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
          }
          .reset-button:hover {
            transform: translateY(-2px);
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .footer a {
            color: #667eea;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎓 Campus Events Hub</h1>
          </div>
          
          <div class="content">
            <h2>Password Reset Request</h2>
            
            <p>Hello,</p>
            
            <p>We received a request to reset the password for your Campus Events Hub ${userType} account. If you made this request, click the link below to reset your password:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="color: #667eea; font-size: 18px; font-weight: bold; text-decoration: underline;">Reset My Password</a>
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong> for security purposes. If you don't reset your password within this time, you'll need to request a new reset link.
            </div>
            
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>If you're having trouble clicking the button, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea; font-size: 14px;">${resetUrl}</p>
            
            <p>Best regards,<br>The Campus Events Hub Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from Campus Events Hub<br>
            If you have questions, contact us at <a href="mailto:support@campusevents.edu">support@campusevents.edu</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
