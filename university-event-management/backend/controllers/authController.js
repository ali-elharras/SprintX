const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const crypto = require("crypto");

// Helper function to determine if email is a vendor email
const isVendorEmail = (email) => {
  // With the new unified email format, GUC emails end with @guc.edu.eg
  // All other emails are vendor emails
  return !/^[a-zA-Z0-9._%+-]+@guc\.edu\.eg$/i.test(email);
};

// Helper function to extract role from university email
const getRoleFromEmail = (email) => {
  // With the new unified email format, we can no longer extract role from email
  // This function is kept for backward compatibility but will return null for new format
  // Role determination now happens during registration with requestedRole field
  if (/^[a-zA-Z0-9._%+-]+@guc\.edu\.eg$/i.test(email)) {
    return "university_member"; // Generic designation for new format
  }
  return null;
};

// Generate JWT Token
const generateToken = (id, userType = "user") => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc    Register user (Student/Staff/TA/Professor)
// @route   POST /api/auth/register/user
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      requestedRole,
      universityId,
      department,
      yearOfStudy,
      phoneNumber,
      verificationEmail,
    } = req.body;

    // Validate that email is using the new GUC format
    if (!email.endsWith("@guc.edu.eg")) {
      return res.status(400).json({
        success: false,
        message: "Email must use GUC domain (@guc.edu.eg)",
      });
    }

    // Determine the role logic:
    // 1. If role is provided (for students), use it
    // 2. If requestedRole is provided, use it for role assignment logic
    const targetRole = role || requestedRole;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: "Either role or requestedRole must be provided",
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if university ID already exists
    const existingUniversityId = await User.findByUniversityId(universityId);
    if (existingUniversityId) {
      return res.status(400).json({
        success: false,
        message: "University ID already registered",
      });
    }

    // New role assignment logic with requestedRole system:
    // - Students: Get immediate access with role "student"
    // - Staff/TA/Professor: Get "pending" role until admin verification

    let finalRole, needsAdminVerification;

    if (targetRole === "student") {
      finalRole = "student";
      needsAdminVerification = false;
    } else if (["staff", "ta", "professor"].includes(targetRole)) {
      finalRole = "pending";
      needsAdminVerification = true;
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role requested",
      });
    }

    // For staff, TA, and professor requesting verification email process
    if (needsAdminVerification && !verificationEmail) {
      // Create incomplete user record for verification email selection
      const incompleteUserData = {
        firstName,
        lastName,
        email,
        password,
        role: finalRole,
        requestedRole: targetRole,
        universityId,
        phoneNumber,
        department,
        isRegistrationComplete: false,
        isVerified: false,
      };

      const incompleteUser = await User.create(incompleteUserData);

      return res.status(200).json({
        success: true,
        message: "Partial registration created. Verification email required.",
        requiresVerificationEmail: true,
        data: {
          userId: incompleteUser._id,
          userData: {
            firstName,
            lastName,
            email,
            role: finalRole,
            requestedRole: targetRole,
            universityId,
            department,
            phoneNumber,
          },
        },
      });
    }

    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: finalRole,
      universityId,
      phoneNumber,
    };

    // Add requestedRole for non-student registrations
    if (needsAdminVerification) {
      userData.requestedRole = targetRole;
    }

    // Add role-specific fields
    if (["student", "staff", "ta", "professor"].includes(targetRole)) {
      userData.department = department;
    }
    if (targetRole === "student") {
      userData.yearOfStudy = yearOfStudy;
    }

    // Add verification email for staff, TA, professor
    if (needsAdminVerification && verificationEmail) {
      userData.verificationEmail = verificationEmail;
    }

    // Verification policy:
    // - Students are auto-verified and get immediate access
    // - Staff/TA/Professor are verified but pending admin role approval
    userData.isVerified = true; // All users are email-verified upon complete registration
    userData.isRegistrationComplete = true;

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id, "user");

    // Update login tracking
    await user.updateLastLogin();

    // Customize message based on role status
    let successMessage;
    if (user.role === "pending") {
      successMessage = `Registration successful! Your ${user.requestedRole} role request is pending admin approval.`;
    } else {
      successMessage = "Registration successful! Welcome to Campus Events Hub!";
    }

    res.status(201).json({
      success: true,
      message: successMessage,
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          requestedRole: user.requestedRole,
          universityId: user.universityId,
          department: user.department,
          yearOfStudy: user.yearOfStudy,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register vendor
// @route   POST /api/auth/register/vendor
// @access  Public
const registerVendor = async (req, res, next) => {
  try {
    console.log("=== VENDOR REGISTRATION DEBUG ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      companyName,
      contactPersonFirstName,
      contactPersonLastName,
      email,
      password,
      businessRegistrationNumber,
      industry,
      companySize,
      phoneNumber,
      website,
      address,
      description,
      servicesOffered,
      interestedEventTypes,
    } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findByEmail(email);
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor with this email already exists",
      });
    }

    // Check if business registration number already exists (only if provided)
    if (
      businessRegistrationNumber &&
      businessRegistrationNumber.trim() !== ""
    ) {
      const existingBusinessReg = await Vendor.findByBusinessRegistration(
        businessRegistrationNumber
      );
      if (existingBusinessReg) {
        return res.status(400).json({
          success: false,
          message: "Business registration number already registered",
        });
      }
    }

    // Create vendor data object, excluding empty strings for optional fields
    const vendorData = {
      companyName,
      email,
      password,
      interestedEventTypes: interestedEventTypes || [],
    };

    // Only add optional fields if they have actual values (not empty strings)
    if (contactPersonFirstName && contactPersonFirstName.trim()) {
      vendorData.contactPersonFirstName = contactPersonFirstName;
    }
    if (contactPersonLastName && contactPersonLastName.trim()) {
      vendorData.contactPersonLastName = contactPersonLastName;
    }
    if (businessRegistrationNumber && businessRegistrationNumber.trim()) {
      vendorData.businessRegistrationNumber = businessRegistrationNumber;
    }
    if (industry && industry.trim()) {
      vendorData.industry = industry;
    }
    if (companySize && companySize.trim()) {
      vendorData.companySize = companySize;
    }
    if (phoneNumber && phoneNumber.trim()) {
      vendorData.phoneNumber = phoneNumber;
    }
    if (website && website.trim()) {
      vendorData.website = website;
    }
    if (description && description.trim()) {
      vendorData.description = description;
    }
    if (address) {
      vendorData.address = address;
    }
    if (servicesOffered && servicesOffered.length > 0) {
      vendorData.servicesOffered = servicesOffered;
    }

    // Create vendor
    const vendor = await Vendor.create(vendorData);

    // Generate token
    const token = generateToken(vendor._id, "vendor");

    // Update login tracking
    await vendor.updateLastLogin();

    res.status(201).json({
      success: true,
      message: "Vendor registered successfully. Awaiting admin approval.",
      data: {
        token,
        vendor: {
          id: vendor._id,
          companyName: vendor.companyName,
          contactPersonFirstName: vendor.contactPersonFirstName,
          contactPersonLastName: vendor.contactPersonLastName,
          email: vendor.email,
          businessRegistrationNumber: vendor.businessRegistrationNumber,
          verificationStatus: vendor.verificationStatus,
          industry: vendor.industry,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email via token (after admin approval)
// @route   GET /api/auth/verify-email/:token
// @desc    Complete user registration with verification email
// @route   POST /api/auth/complete-registration
// @access  Public
const completeUserRegistration = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { userId, verificationEmail } = req.body;

    if (!userId || !verificationEmail) {
      return res.status(400).json({
        success: false,
        message: "User ID and verification email are required",
      });
    }

    // Find the incomplete user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if registration is already complete
    if (user.isRegistrationComplete) {
      return res.status(400).json({
        success: false,
        message: "Registration is already complete",
      });
    }

    // Update user with verification email and mark registration complete
    user.verificationEmail = verificationEmail;
    user.isRegistrationComplete = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id, "user");

    // Update login tracking
    await user.updateLastLogin();

    res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          universityId: user.universityId,
          department: user.department,
          verificationEmail: user.verificationEmail,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user/vendor
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    let account;
    let accountType;

    // Automatically determine account type from email domain
    if (isVendorEmail(email)) {
      account = await Vendor.findByEmail(email).select("+password");
      accountType = "vendor";
    } else {
      // This includes student, staff, ta, professor, admin, and events_office
      account = await User.findByEmail(email).select("+password");
      accountType = "user";

      // Log for debugging login attempts
      if (
        account &&
        (account.role === "admin" || account.role === "events_office")
      ) {
        console.log(`🔐 [LOGIN] ${account.role} login attempt for: ${email}`);
      }
    }

    // Check if account exists
    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if registration is incomplete (for staff, TA, professor)
    if (accountType === "user" && account.isRegistrationComplete === false) {
      // Check password first
      const isPasswordMatch = await account.comparePassword(password);
      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      return res.status(200).json({
        success: false,
        message:
          "Registration incomplete. Please complete your verification email selection.",
        requiresVerificationEmail: true,
        data: {
          userId: account._id,
          userData: {
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email,
            role: account.role,
            universityId: account.universityId,
            department: account.department,
            phoneNumber: account.phoneNumber,
          },
        },
      });
    }

    // Check if account is active
    if (!account.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive. Please contact support.",
      });
    }

    // Block users with pending role - but handle approved vs truly pending differently
    if (accountType === "user" && account.role === "pending") {
      // If user has approvedRole, they've been approved but need email verification
      if (account.approvedRole) {
        // Check if verification email has been sent
        if (account.emailVerificationSent) {
          return res.status(403).json({
            success: false,
            message:
              "Verification email sent to your email. If email not received, you can reapply for verification.",
            emailVerificationSent: true,
            canReapply: true,
            data: {
              userId: account._id,
              email: account.email,
              verificationEmail: account.verificationEmail,
            },
          });
        } else {
          // Approved but email not sent yet - shouldn't happen, but handle gracefully
          return res.status(403).json({
            success: false,
            message: `Your ${account.approvedRole} role has been approved but verification email is pending. Please contact administrator.`,
            isPending: true,
            data: {
              userId: account._id,
              requestedRole: account.requestedRole,
            },
          });
        }
      } else {
        // Truly pending - awaiting admin approval
        return res.status(403).json({
          success: false,
          message: `Your ${
            account.requestedRole || "role"
          } request is pending admin approval. You'll be able to log in once approved.`,
          isPending: true,
          data: {
            userId: account._id,
            requestedRole: account.requestedRole,
          },
        });
      }
    }

    // Enforce verification for academics (staff/ta/professor) - legacy logic
    if (
      accountType === "user" &&
      ["staff", "ta", "professor"].includes(account.role) &&
      !account.isVerified
    ) {
      // Check if verification email has been sent
      if (account.emailVerificationSent) {
        return res.status(403).json({
          success: false,
          message:
            "Verification email sent to your email. If email not received, you can reapply for verification.",
          emailVerificationSent: true,
          canReapply: true,
          data: {
            userId: account._id,
            email: account.email,
            verificationEmail: account.verificationEmail,
          },
        });
      } else {
        return res.status(403).json({
          success: false,
          message:
            "Your account is awaiting verification by an administrator. You'll be able to log in once verified.",
        });
      }
    }

    // Check password
    const isPasswordMatch = await account.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(account._id, accountType);

    // Update login tracking
    await account.updateLastLogin();

    // Prepare response data
    let responseData;
    if (accountType === "vendor") {
      responseData = {
        token,
        vendor: {
          id: account._id,
          companyName: account.companyName,
          contactPersonFirstName: account.contactPersonFirstName,
          contactPersonLastName: account.contactPersonLastName,
          email: account.email,
          verificationStatus: account.verificationStatus,
          industry: account.industry,
          interestedEventTypes: account.interestedEventTypes,
        },
      };
    } else {
      responseData = {
        token,
        user: {
          id: account._id,
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          role: account.role,
          universityId: account.universityId,
          department: account.department,
          yearOfStudy: account.yearOfStudy,
          isVerified: account.isVerified,
        },
      };
    }

    res.status(200).json({
      success: true,
      message: `${
        accountType === "vendor" ? "Vendor" : "User"
      } logged in successfully`,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user/vendor
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // Note: Since we're using JWT tokens, we can't invalidate them server-side
    // The client should remove the token from storage
    // In a production app, you might want to implement a token blacklist

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user/vendor profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    if (req.userType === "vendor") {
      const vendor = await Vendor.findById(req.vendor._id);
      res.status(200).json({
        success: true,
        data: {
          vendor: {
            id: vendor._id,
            companyName: vendor.companyName,
            contactPersonFirstName: vendor.contactPersonFirstName,
            contactPersonLastName: vendor.contactPersonLastName,
            email: vendor.email,
            businessRegistrationNumber: vendor.businessRegistrationNumber,
            verificationStatus: vendor.verificationStatus,
            industry: vendor.industry,
            companySize: vendor.companySize,
            phoneNumber: vendor.phoneNumber,
            website: vendor.website,
            address: vendor.address,
            description: vendor.description,
            servicesOffered: vendor.servicesOffered,
            interestedEventTypes: vendor.interestedEventTypes,
            createdAt: vendor.createdAt,
            lastLogin: vendor.lastLogin,
          },
        },
      });
    } else {
      const user = await User.findById(req.user._id);
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            universityId: user.universityId,
            department: user.department,
            yearOfStudy: user.yearOfStudy,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            bio: user.bio,
            isVerified: user.isVerified,
            emailNotifications: user.emailNotifications,
            smsNotifications: user.smsNotifications,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
          },
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Forgot Password
const forgotPassword = async (req, res, next) => {
  console.log(
    `🔄 [FORGOT PASSWORD] Request received - Time: ${new Date().toISOString()}`
  );
  console.log(`🔄 [FORGOT PASSWORD] Request body:`, req.body);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`❌ [FORGOT PASSWORD] Validation failed:`, errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email } = req.body;
    console.log(`🔄 [FORGOT PASSWORD] Processing request for email: ${email}`);

    const emailService = require("../services/emailService");
    const crypto = require("crypto");

    // Check if user exists (both user and vendor collections)
    console.log(`🔍 [FORGOT PASSWORD] Looking up user account for: ${email}`);
    let account = await User.findByEmail(email);
    let userType = "user";

    if (!account) {
      console.log(
        `🔍 [FORGOT PASSWORD] User not found, checking vendor collection...`
      );
      account = await Vendor.findByEmail(email);
      userType = "vendor";
    }

    if (!account) {
      console.log(`⚠️ [FORGOT PASSWORD] No account found for email: ${email}`);
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    console.log(
      `✅ [FORGOT PASSWORD] Account found - Type: ${userType}, ID: ${account._id}`
    );

    // Generate reset token
    console.log(`🔐 [FORGOT PASSWORD] Generating reset token...`);
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
    console.log(
      `🔐 [FORGOT PASSWORD] Reset token generated: ${resetToken.substring(
        0,
        8
      )}...`
    );

    // Save reset token to account
    console.log(`💾 [FORGOT PASSWORD] Saving reset token to account...`);
    account.passwordResetToken = resetToken;
    account.passwordResetTokenExpires = resetTokenExpiry;
    await account.save();
    console.log(`✅ [FORGOT PASSWORD] Reset token saved successfully`);

    // Send reset email
    try {
      console.log(`🔄 Attempting to send password reset email to: ${email}`);
      await emailService.sendPasswordResetEmail(email, resetToken, userType);
      console.log(`✅ Password reset email sent successfully to: ${email}`);
    } catch (emailError) {
      console.error(
        `❌ Failed to send password reset email to ${email}:`,
        emailError
      );
      // Don't throw the error to avoid revealing email existence
      // but log it for debugging
    }

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error(`❌ [FORGOT PASSWORD] Error occurred:`, error);
    next(error);
  }
};

// Verify Reset Token
const verifyResetToken = async (req, res, next) => {
  console.log(
    `🔍 [VERIFY TOKEN] Request received - Time: ${new Date().toISOString()}`
  );

  try {
    const { token } = req.params;
    console.log(
      `🔍 [VERIFY TOKEN] Checking token: ${token?.substring(0, 8)}...`
    );

    if (!token) {
      console.log(`❌ [VERIFY TOKEN] No token provided`);
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    console.log(
      `🕒 [VERIFY TOKEN] Current time: ${Date.now()}, Date: ${new Date()}`
    );

    // Check if token exists and is not expired (both user and vendor)
    let account = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    let userType = "user";
    if (!account) {
      console.log(
        `🔍 [VERIFY TOKEN] User not found, checking vendor collection...`
      );
      account = await Vendor.findOne({
        passwordResetToken: token,
        passwordResetTokenExpires: { $gt: Date.now() },
      });
      userType = "vendor";
    }

    if (!account) {
      console.log(`❌ [VERIFY TOKEN] No valid account found`);
      // Check if token exists but is expired for debugging
      let expiredAccount = await User.findOne({ passwordResetToken: token });
      if (!expiredAccount) {
        expiredAccount = await Vendor.findOne({ passwordResetToken: token });
      }
      if (expiredAccount) {
        console.log(
          `⏰ [VERIFY TOKEN] Token found but expired. Expires: ${
            expiredAccount.passwordResetTokenExpires
          }, Now: ${new Date()}`
        );
      } else {
        console.log(`🚫 [VERIFY TOKEN] Token not found in database at all`);
      }
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    console.log(
      `✅ [VERIFY TOKEN] Valid token found for ${userType} ID: ${account._id}`
    );
    res.status(200).json({
      success: true,
      message: "Reset token is valid",
    });
  } catch (error) {
    console.error(`❌ [VERIFY TOKEN] Error occurred:`, error);
    next(error);
  }
};

// Reset Password
const resetPassword = async (req, res, next) => {
  console.log(
    `🔄 [RESET PASSWORD] Request received - Time: ${new Date().toISOString()}`
  );

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(`❌ [RESET PASSWORD] Validation failed:`, errors.array());
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { token, password } = req.body;
    console.log(
      `🔍 [RESET PASSWORD] Looking up account with token: ${token.substring(
        0,
        8
      )}...`
    );
    console.log(
      `🕒 [RESET PASSWORD] Current time: ${Date.now()}, Date: ${new Date()}`
    );

    // Find account with valid reset token (both user and vendor)
    let account = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    let userType = "user";
    if (!account) {
      console.log(
        `🔍 [RESET PASSWORD] User not found, checking vendor collection...`
      );
      account = await Vendor.findOne({
        passwordResetToken: token,
        passwordResetTokenExpires: { $gt: Date.now() },
      });
      userType = "vendor";
    }

    if (!account) {
      console.log(`❌ [RESET PASSWORD] No account found with valid token`);
      // Let's also check if token exists but is expired
      let expiredAccount = await User.findOne({ passwordResetToken: token });
      if (!expiredAccount) {
        expiredAccount = await Vendor.findOne({ passwordResetToken: token });
      }
      if (expiredAccount) {
        console.log(
          `⏰ [RESET PASSWORD] Token found but expired. Expires: ${
            expiredAccount.passwordResetTokenExpires
          }, Now: ${new Date()}`
        );
      } else {
        console.log(`🚫 [RESET PASSWORD] Token not found in database at all`);
      }
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    console.log(
      `✅ [RESET PASSWORD] Valid account found - Type: ${userType}, ID: ${account._id}`
    );

    // Update password and clear reset token
    console.log(
      `🔐 [RESET PASSWORD] Updating password and clearing reset token...`
    );
    account.password = password; // Will be hashed by pre-save middleware
    account.passwordResetToken = undefined;
    account.passwordResetTokenExpires = undefined;
    await account.save();

    console.log(
      `✅ [RESET PASSWORD] Password reset completed successfully for ${userType} ID: ${account._id}`
    );
    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error(`❌ [RESET PASSWORD] Error occurred:`, error);
    next(error);
  }
};

// @desc    Verify email via token (after admin approval)
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    console.log(`🔍 [EMAIL VERIFICATION] Attempting to verify token: ${token}`);

    if (!token) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/?verification=failed&reason=no-token`
      );
    }

    // Look up user by verificationToken and ensure not expired
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    }).select("+verificationToken +verificationTokenExpires");

    if (!user) {
      console.log(`❌ [EMAIL VERIFICATION] No user found with valid token`);

      // Check if token exists but is expired
      const expiredUser = await User.findOne({
        verificationToken: token,
      }).select("+verificationToken +verificationTokenExpires");
      if (expiredUser) {
        console.log(
          `⏰ [EMAIL VERIFICATION] Token found but expired. Expires: ${
            expiredUser.verificationTokenExpires
          }, Now: ${new Date()}`
        );
        return res.redirect(
          `${process.env.FRONTEND_URL}/?verification=failed&reason=expired`
        );
      } else {
        console.log(`🚫 [EMAIL VERIFICATION] Token not found in database`);
        return res.redirect(
          `${process.env.FRONTEND_URL}/?verification=failed&reason=invalid`
        );
      }
    }

    console.log(
      `✅ [EMAIL VERIFICATION] Valid user found - ID: ${user._id}, Name: ${user.firstName} ${user.lastName}`
    );

    // Verify the user, assign approved role, and clear verification token
    user.isVerified = true;
    // Change role from "pending" to the approved role
    if (user.approvedRole) {
      user.role = user.approvedRole;
      user.approvedRole = undefined; // Clean up - no longer needed
    }
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log(
      `🎉 [EMAIL VERIFICATION] User verified successfully - ID: ${user._id}`
    );

    // Redirect to login page with success message
    res.redirect(`${process.env.FRONTEND_URL}/?verified=true`);
  } catch (error) {
    console.error(`❌ [EMAIL VERIFICATION] Error occurred:`, error);
    next(error);
  }
};

// @desc    Reapply for email verification (reset emailVerificationSent to false)
// @route   POST /api/auth/reapply-verification
// @access  Public
const reapplyVerification = async (req, res, next) => {
  try {
    const { userId } = req.body;

    console.log(`🔄 [REAPPLY VERIFICATION] Request for user ID: ${userId}`);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is eligible for reapplication
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    // Check if user is in pending status (new system) or has staff/ta/professor role (legacy)
    if (
      user.role !== "pending" &&
      !["staff", "ta", "professor"].includes(user.role)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only pending or academic role accounts can reapply for verification",
      });
    }

    // Reset emailVerificationSent to false so admin can send verification email again
    // Also reset approved role so they go back to admin verification queue
    user.emailVerificationSent = false;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    if (user.approvedRole) {
      // If they had an approved role but reapplying, clear it and make them go through approval again
      user.approvedRole = undefined;
      user.role = "pending"; // Ensure role is back to pending
    }
    await user.save();

    console.log(
      `✅ [REAPPLY VERIFICATION] Reset verification status for user ID: ${userId}`
    );

    res.status(200).json({
      success: true,
      message:
        "Verification status reset successfully. Please wait for administrator to approve and send new verification email.",
      data: {
        userId: user._id,
        email: user.email,
        verificationEmail: user.verificationEmail,
        emailVerificationSent: user.emailVerificationSent,
      },
    });
  } catch (error) {
    console.error(`❌ [REAPPLY VERIFICATION] Error occurred:`, error);
    next(error);
  }
};

module.exports = {
  registerUser,
  completeUserRegistration,
  registerVendor,
  login,
  logout,
  getProfile,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  verifyEmail,
  reapplyVerification,
};
