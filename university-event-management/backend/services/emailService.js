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

      // NOTE: createTransporter is invalid, should be createTransport
      this.transporter = nodemailer.createTransport({
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

  // Send account verification email with tokenized link to backend verification endpoint
  async sendVerificationEmail(
    to,
    verifyToken,
    fullName = "",
    requestedRole = ""
  ) {
    // Construct backend URL using environment variables
    const backendPort = process.env.PORT || 8080;
    const backendBase =
      process.env.BACKEND_URL ||
      process.env.API_BASE_URL ||
      `http://localhost:${backendPort}`;
    const verifyUrl = `${backendBase.replace(
      /\/$/,
      ""
    )}/api/auth/verify-email/${verifyToken}`;

    const subject = "Verify your account - SprintX";

    const mailOptions = {
      from: `"SprintX" <${
        process.env.EMAIL_USER || "no-reply@campusevents.test"
      }>`,
      to,
      subject,
      html: this.getVerificationEmailTemplate({
        verifyUrl,
        fullName,
        requestedRole,
      }),
      text:
        `Hello${fullName ? ` ${fullName}` : ""},\n\n` +
        `Please verify your SprintX account by visiting the link below:\n${verifyUrl}\n\n` +
        `If you did not create this account, you can safely ignore this email.`,
    };

    try {
      if (!this.transporter) {
        console.log(
          "⚠️ No transporter available - falling back to console mode"
        );
        console.log("📧 Verification Email (Console Mode):");
        console.log("   To:", to);
        console.log("   Verify URL:", verifyUrl);
        console.log("   Subject:", subject);
        return { success: true, messageId: "console-log" };
      }

      const info = await this.transporter.sendMail(mailOptions);
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log("✅ Verification email sent successfully", {
          to,
          messageId: info.messageId,
        });
      } else {
        console.log("📧 Test verification email sent:");
        console.log("   Preview URL:", nodemailer.getTestMessageUrl(info));
      }
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send verification email:", error.message);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  getVerificationEmailTemplate({
    verifyUrl,
    fullName = "",
    requestedRole = "",
  }) {
    const safeName = fullName || "there";
    const roleLine = requestedRole
      ? `<p>Your requested role: <strong>${requestedRole}</strong></p>`
      : "";
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your account - SprintX</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; max-width: 640px; margin: 0 auto; background: #f6f8fa; padding: 24px; }
          .card { background: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); overflow: hidden; }
          .header { background: linear-gradient(135deg,#667eea,#764ba2); color: #fff; padding: 24px; text-align: center; }
          .content { padding: 28px; }
          .btn { display: inline-block; background: #667eea; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; }
          .note { color: #666; font-size: 14px; margin-top: 16px; }
          .footer { color: #777; font-size: 12px; text-align: center; padding: 18px 24px; background: #fafbfc; }
          .link { color: #667eea; word-break: break-all; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header"><h2>SprintX</h2></div>
          <div class="content">
            <p>Hello ${safeName},</p>
            <p>Please verify your account to complete the approval process and start using SprintX.</p>
            ${roleLine}
            <p style="margin:20px 0; text-align:center;">
              <a class="btn" href="${verifyUrl}">Verify My Account</a>
            </p>
            <p class="note">If the button doesn't work, copy and paste this link into your browser:</p>
            <p class="link">${verifyUrl}</p>
            <p class="note">If you did not request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">© ${new Date().getFullYear()} SprintX</div>
        </div>
      </body>
      </html>
    `;
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
      from: `"SprintX" <${process.env.EMAIL_USER}>`, // Use the authenticated Gmail account as sender
      to: to,
      subject: "Password Reset Request - SprintX",
      html: this.getPasswordResetEmailTemplate(resetUrl, userType),
      text: `
        You requested a password reset for your SprintX account.
        
        Click the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour for security purposes.
        
        If you didn't request this reset, please ignore this email.
        
        Best regards,
        SprintX Team
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
        <title>Password Reset - SprintX</title>
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
            <h1>SprintX</h1>
          </div>
          
          <div class="content">
            <h2>Password Reset Request</h2>
            
            <p>Hello,</p>
            
            <p>We received a request to reset the password for your SprintX ${userType} account. If you made this request, click the link below to reset your password:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="color: #667eea; font-size: 18px; font-weight: bold; text-decoration: underline;">Reset My Password</a>
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong> for security purposes. If you don't reset your password within this time, you'll need to request a new reset link.
            </div>
            
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>If you're having trouble clicking the button, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea; font-size: 14px;">${resetUrl}</p>
            
            <p>Best regards,<br>The SprintX Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from SprintX<br>
            If you have questions, contact us at <a href="mailto:support@campusevents.edu">support@campusevents.edu</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendVerificationEmail(to, verificationToken, fullName, role) {
    console.log(
      `📧 sendVerificationEmail called with: to=${to}, fullName=${fullName}, role=${role}`
    );
    console.log(`🔧 Transporter status:`, !!this.transporter);

    // Construct backend URL using environment variables
    const backendPort = process.env.PORT || 8080;
    const verifyUrl = `${
      process.env.BACKEND_URL || `http://localhost:${backendPort}`
    }/api/auth/verify-email/${verificationToken}`;

    const mailOptions = {
      from: `"SprintX" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Account Verification - SprintX",
      html: this.getVerificationEmailTemplate(verifyUrl, fullName, role),
      text: `
        Dear ${fullName},

        Your ${role} account has been approved by the administrator!
        
        To complete your account activation, please click the following link:
        ${verifyUrl}
        
        This link will expire in 24 hours for security purposes.
        
        Once verified, you'll be able to access all features of SprintX.
        
        Best regards,
        SprintX Team
      `,
    };

    try {
      if (!this.transporter) {
        console.log(
          "⚠️ No transporter available - falling back to console mode"
        );
        console.log("📧 Verification Email (Console Mode):");
        console.log("   To:", to);
        console.log("   Verify URL:", verifyUrl);
        console.log("   Subject:", mailOptions.subject);
        return { success: true, messageId: "console-log" };
      }

      console.log(`📧 Sending verification email to: ${to}`);
      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log("✅ Verification email sent successfully!");
        console.log(`   To: ${to}`);
        console.log(`   Message ID: ${info.messageId}`);
      } else {
        console.log("📧 Test verification email sent:");
        console.log("   Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send verification email:", error.message);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  getVerificationEmailTemplate(verifyUrl, fullName, role) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification - SprintX</title>
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
            color: #333333;
          }
          .content p {
            color: #333333 !important;
          }
          .content h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 24px;
          }
          .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none !important;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
          }
          .verify-button:hover {
            transform: translateY(-2px);
          }
          .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #155724;
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
            <h1>SprintX</h1>
          </div>
          
          <div class="content">
            <h2>🎉 Account Approved!</h2>
            
            <p>Dear ${fullName},</p>
            
            <div class="success">
              <strong>🎊 Great news!</strong> Your ${role} account has been approved by our administrator team.
            </div>
            
            <p>To complete your account activation and gain access to all SprintX features, please verify your email address by clicking the button below:</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" class="verify-button">Verify My Account</a>
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This verification link will expire in <strong>24 hours</strong> for security purposes. Please verify your account as soon as possible.
            </div>
            
            <p>Once verified, you'll be able to:</p>
            <ul>
              <li>Access your personalized dashboard</li>
              <li>Manage events and activities</li>
              <li>Connect with the university community</li>
              <li>Receive important notifications</li>
            </ul>
            
            <p>If you're having trouble clicking the button, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea; font-size: 14px;">${verifyUrl}</p>
            
            <p>Welcome to SprintX!</p>
            
            <p>Best regards,<br>The SprintX Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from SprintX<br>
            If you have questions, contact us at <a href="mailto:support@campusevents.edu">support@campusevents.edu</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send application approval email with payment information
  async sendApplicationApprovalEmail(to, vendorName, applicationType, eventName, paymentAmount, paymentDeadline) {
    const formattedDeadline = new Date(paymentDeadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"SprintX" <${process.env.EMAIL_USER || "no-reply@campusevents.test"}>`,
      to: to,
      subject: `Application Approved - Payment Required - SprintX`,
      html: this.getApplicationApprovalEmailTemplate({
        vendorName,
        applicationType,
        eventName,
        paymentAmount,
        formattedDeadline,
      }),
      text: `
        Dear ${vendorName},

        Congratulations! Your ${applicationType} application has been approved.

        Event: ${eventName}
        Payment Amount: $${paymentAmount.toFixed(2)}
        Payment Deadline: ${formattedDeadline}

        Please complete your payment within 3 days to confirm your participation.
        You can make the payment through your vendor dashboard.

        If you have any questions, please contact our support team.

        Best regards,
        SprintX Team
      `,
    };

    try {
      if (!this.transporter) {
        console.log("⚠️ No transporter available - falling back to console mode");
        console.log("📧 Application Approval Email (Console Mode):");
        console.log("   To:", to);
        console.log("   Subject:", mailOptions.subject);
        console.log("   Payment Amount:", paymentAmount);
        console.log("   Payment Deadline:", formattedDeadline);
        return { success: true, messageId: "console-log" };
      }

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log("✅ Application approval email sent successfully!");
        console.log(`   To: ${to}`);
        console.log(`   Message ID: ${info.messageId}`);
      } else {
        console.log("📧 Test application approval email sent:");
        console.log("   Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Failed to send application approval email:", error.message);
      throw new Error(`Failed to send application approval email: ${error.message}`);
    }
  }

  getApplicationApprovalEmailTemplate({ vendorName, applicationType, eventName, paymentAmount, formattedDeadline }) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Approved - SprintX</title>
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            color: #10b981;
            margin-top: 0;
            font-size: 24px;
          }
          .success-badge {
            background: #d1fae5;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          .success-badge h3 {
            color: #059669;
            margin: 0 0 10px 0;
            font-size: 20px;
          }
          .payment-info {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
          }
          .payment-info h4 {
            color: #d97706;
            margin-top: 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #6b7280;
          }
          .info-value {
            color: #111827;
            font-weight: 600;
          }
          .amount {
            font-size: 24px;
            color: #10b981;
            font-weight: bold;
          }
          .deadline {
            font-size: 18px;
            color: #dc2626;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
          }
          .warning {
            background: #fee2e2;
            border: 1px solid #fca5a5;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #991b1b;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 SprintX</h1>
          </div>
          
          <div class="content">
            <h2>Application Approved!</h2>
            
            <p>Dear ${vendorName},</p>
            
            <div class="success-badge">
              <h3>✅ Congratulations!</h3>
              <p style="margin: 0;">Your ${applicationType} application has been approved.</p>
            </div>
            
            <div class="info-row">
              <span class="info-label">Event:</span>
              <span class="info-value">${eventName || 'Booth Request'}</span>
            </div>
            
            <div class="payment-info">
              <h4>💳 Payment Required</h4>
              <p>To confirm your participation, please complete the payment within the deadline:</p>
              
              <div class="info-row">
                <span class="info-label">Amount:</span>
                <span class="amount">$${paymentAmount.toFixed(2)}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Deadline:</span>
                <span class="deadline">${formattedDeadline}</span>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> You have <strong>3 days</strong> from receiving this email to complete your payment. Failure to pay by the deadline will result in automatic cancellation of your participation.
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/vendor/dashboard" class="cta-button">Go to Dashboard & Pay</a>
            </p>
            
            <p>You can make the payment through your vendor dashboard. Simply log in and navigate to your approved applications.</p>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The SprintX Team</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from SprintX<br>
            If you have questions, contact us at <a href="mailto:support@campusevents.edu">support@campusevents.edu</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send payment receipt email
  async sendPaymentReceiptEmail(to, vendorName, applicationType, eventName, paymentAmount, transactionId, paidAt) {
    const formattedDate = new Date(paidAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const receiptNumber = `RCPT-${Date.now()}-${transactionId.slice(-8)}`;

    const mailOptions = {
      from: `"SprintX" <${process.env.EMAIL_USER || "no-reply@campusevents.test"}>`,
      to: to,
      subject: `Payment Receipt - ${receiptNumber} - SprintX`,
      html: this.getPaymentReceiptEmailTemplate({
        vendorName,
        applicationType,
        eventName,
        paymentAmount,
        transactionId,
        formattedDate,
        receiptNumber,
      }),
      text: `
        Payment Receipt
        
        Dear ${vendorName},

        Thank you for your payment! This email confirms your successful payment for ${applicationType} participation.

        Receipt Number: ${receiptNumber}
        Event: ${eventName}
        Amount Paid: $${paymentAmount.toFixed(2)}
        Payment Date: ${formattedDate}
        Transaction ID: ${transactionId}

        Your participation is now confirmed. You will receive further details about the event closer to the date.

        If you have any questions, please contact our support team.

        Best regards,
        SprintX Team
      `,
    };

    try {
      if (!this.transporter) {
        console.log("⚠️ No transporter available - falling back to console mode");
        console.log("📧 Payment Receipt Email (Console Mode):");
        console.log("   To:", to);
        console.log("   Receipt Number:", receiptNumber);
        console.log("   Amount:", paymentAmount);
        console.log("   Transaction ID:", transactionId);
        return { success: true, messageId: "console-log" };
      }

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log("✅ Payment receipt email sent successfully!");
        console.log(`   To: ${to}`);
        console.log(`   Receipt: ${receiptNumber}`);
        console.log(`   Message ID: ${info.messageId}`);
      } else {
        console.log("📧 Test payment receipt email sent:");
        console.log("   Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId, receiptNumber };
    } catch (error) {
      console.error("❌ Failed to send payment receipt email:", error.message);
      throw new Error(`Failed to send payment receipt email: ${error.message}`);
    }
  }

  getPaymentReceiptEmailTemplate({ vendorName, applicationType, eventName, paymentAmount, transactionId, formattedDate, receiptNumber }) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt - SprintX</title>
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
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .receipt-badge {
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 10px;
            font-size: 14px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 24px;
          }
          .success-message {
            background: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .success-message h3 {
            color: #059669;
            margin: 0 0 5px 0;
            font-size: 18px;
          }
          .receipt-details {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #6b7280;
          }
          .detail-value {
            color: #111827;
            text-align: right;
          }
          .amount-row {
            background: #f3f4f6;
            margin: -20px -20px 0 -20px;
            padding: 20px;
            border-radius: 0 0 8px 8px;
          }
          .amount-row .detail-label {
            font-size: 18px;
            color: #111827;
          }
          .amount-row .detail-value {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
          }
          .transaction-id {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            word-break: break-all;
            color: #92400e;
          }
          .info-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
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
          .checkmark {
            font-size: 48px;
            color: #10b981;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 SprintX</h1>
            <div class="receipt-badge">Payment Receipt</div>
          </div>
          
          <div class="content">
            <div class="checkmark">✓</div>
            <h2 style="text-align: center;">Payment Successful!</h2>
            
            <p>Dear ${vendorName},</p>
            
            <div class="success-message">
              <h3>Thank you for your payment!</h3>
              <p style="margin: 5px 0 0 0;">Your payment has been processed successfully and your participation is now confirmed.</p>
            </div>
            
            <div class="receipt-details">
              <div class="detail-row">
                <span class="detail-label">Receipt Number:</span>
                <span class="detail-value"><strong>${receiptNumber}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Event:</span>
                <span class="detail-value">${eventName || 'Booth Request'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Type:</span>
                <span class="detail-value">${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${formattedDate}</span>
              </div>
              <div class="amount-row">
                <div class="detail-row" style="border: none;">
                  <span class="detail-label">Amount Paid:</span>
                  <span class="detail-value">$${paymentAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div class="transaction-id">
              <strong>Transaction ID:</strong><br>
              ${transactionId}
            </div>
            
            <div class="info-box">
              <strong>📅 What's Next?</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Your participation is confirmed</li>
                <li>You'll receive event details closer to the date</li>
                <li>Keep this receipt for your records</li>
                <li>Contact support if you have any questions</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px;">If you have any questions about this payment or your participation, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The SprintX Team</p>
          </div>
          
          <div class="footer">
            <p><strong>SprintX - University Event Management</strong></p>
            <p>This is an automated receipt. Please keep it for your records.</p>
            <p>Questions? Contact us at <a href="mailto:support@campusevents.edu">support@campusevents.edu</a></p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
              © ${new Date().getFullYear()} SprintX. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send QR code email to visitor
  async sendVisitorQRCodeEmail(visitorEmail, vendorName, eventName, applicationType, qrCodeDataURL, visitorNumber, totalVisitors) {
    const mailOptions = {
      from: `"SprintX" <${process.env.EMAIL_USER || "no-reply@campusevents.test"}>`,
      to: visitorEmail,
      subject: `Your Event Access QR Code - ${eventName} - SprintX`,
      html: this.getVisitorQRCodeEmailTemplate({
        visitorEmail,
        vendorName,
        eventName,
        applicationType,
        qrCodeDataURL,
        visitorNumber,
        totalVisitors,
      }),
      text: `
        Your Event Access QR Code

        Dear Visitor,

        You have been registered for ${eventName} by ${vendorName}.

        Your visitor number: ${visitorNumber} of ${totalVisitors}

        Please present the QR code attached to this email at the event entrance for check-in.

        Event Details:
        - Event: ${eventName}
        - Type: ${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)}
        - Vendor: ${vendorName}

        Important:
        - Keep this email safe
        - Present QR code at entrance
        - One QR code per person

        See you at the event!

        Best regards,
        SprintX Team
      `,
    };

    try {
      if (!this.transporter) {
        console.log("⚠️ No transporter available - falling back to console mode");
        console.log("📧 Visitor QR Code Email (Console Mode):");
        console.log("   To:", visitorEmail);
        console.log("   Event:", eventName);
        console.log("   Visitor:", visitorNumber, "of", totalVisitors);
        return { success: true, messageId: "console-log" };
      }

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        console.log(`✅ QR code email sent to visitor ${visitorNumber}:`, visitorEmail);
      } else {
        console.log(`📧 Test QR code email sent to visitor ${visitorNumber}:`);
        console.log("   Preview URL:", nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send QR code email to ${visitorEmail}:`, error.message);
      throw new Error(`Failed to send QR code email: ${error.message}`);
    }
  }

  getVisitorQRCodeEmailTemplate({ visitorEmail, vendorName, eventName, applicationType, qrCodeDataURL, visitorNumber, totalVisitors }) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Event QR Code - SprintX</title>
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
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .qr-badge {
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            margin-top: 10px;
            font-size: 14px;
          }
          .content {
            padding: 40px 30px;
          }
          .content h2 {
            color: #667eea;
            margin-top: 0;
            font-size: 24px;
            text-align: center;
          }
          .qr-container {
            background: #f9fafb;
            border: 3px dashed #667eea;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
          }
          .qr-code {
            max-width: 300px;
            width: 100%;
            height: auto;
            margin: 20px auto;
            display: block;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .visitor-info {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .visitor-info h3 {
            color: #1e40af;
            margin: 0 0 15px 0;
            font-size: 18px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #dbeafe;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: 600;
            color: #6b7280;
          }
          .info-value {
            color: #111827;
            text-align: right;
          }
          .instructions {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .instructions h3 {
            color: #92400e;
            margin: 0 0 10px 0;
            font-size: 18px;
          }
          .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 8px 0;
            color: #78350f;
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
          .ticket-icon {
            font-size: 64px;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 SprintX</h1>
            <div class="qr-badge">Event Access QR Code</div>
          </div>
          
          <div class="content">
            <div class="ticket-icon">🎫</div>
            <h2>Your Event Access Pass</h2>
            
            <p style="text-align: center; font-size: 16px;">
              You're all set for <strong>${eventName}</strong>!
            </p>
            
            <div class="visitor-info">
              <h3>📋 Event Details</h3>
              <div class="info-row">
                <span class="info-label">Event:</span>
                <span class="info-value">${eventName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Vendor:</span>
                <span class="info-value">${vendorName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Your Email:</span>
                <span class="info-value">${visitorEmail}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Visitor Number:</span>
                <span class="info-value">${visitorNumber} of ${totalVisitors}</span>
              </div>
            </div>
            
            <div class="qr-container">
              <h3 style="color: #667eea; margin-top: 0;">Your QR Code</h3>
              <p style="color: #6b7280; margin: 10px 0;">Present this at the entrance</p>
              <img src="${qrCodeDataURL}" alt="Event QR Code" class="qr-code" />
              <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;">
                Scan this code at the event entrance for quick check-in
              </p>
            </div>
            
            <div class="instructions">
              <h3>⚠️ Important Instructions</h3>
              <ul>
                <li><strong>Save this email</strong> - You'll need it at the event</li>
                <li><strong>Print or show on phone</strong> - Either works for check-in</li>
                <li><strong>One code per person</strong> - This QR code is unique to you</li>
                <li><strong>Arrive early</strong> - Allow time for check-in</li>
                <li><strong>Keep it safe</strong> - Don't share your QR code</li>
              </ul>
            </div>
            
            <p style="text-align: center; margin-top: 30px; font-size: 18px; color: #667eea;">
              <strong>See you at the event! 🎉</strong>
            </p>
            
            <p style="margin-top: 20px;">
              If you have any questions or issues with your QR code, please contact the vendor or our support team.
            </p>
            
            <p>Best regards,<br>The SprintX Team</p>
          </div>
          
          <div class="footer">
            <p><strong>SprintX - University Event Management</strong></p>
            <p>This QR code is unique to you. Please do not share it.</p>
            <p>Questions? Contact us at <a href="mailto:support@campusevents.edu">support@campusevents.edu</a></p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
              © ${new Date().getFullYear()} SprintX. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
