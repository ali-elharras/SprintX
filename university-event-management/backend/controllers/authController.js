const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Vendor = require("../models/Vendor");

// Helper function to determine if email is a vendor email
const isVendorEmail = (email) => {
  const vendorPattern =
    /^[a-zA-Z0-9._%+-]+@(?!student\.|staff\.|ta\.|professor\.).+$/;
  const universityPattern =
    /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor)\.[a-zA-Z0-9.-]+$/;
  return vendorPattern.test(email) && !universityPattern.test(email);
};

// Helper function to extract role from university email
const getRoleFromEmail = (email) => {
  const match = email.match(
    /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor)\.[a-zA-Z0-9.-]+$/
  );
  return match ? match[1] : null;
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
      universityId,
      department,
      yearOfStudy,
      phoneNumber,
    } = req.body;

    // Validate that the provided role matches the email domain
    const emailRole = getRoleFromEmail(email);
    if (!emailRole) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid university email domain. Please use @student, @staff, @ta, or @professor domain.",
      });
    }

    if (role !== emailRole) {
      return res.status(400).json({
        success: false,
        message: `Role mismatch. Email domain suggests '${emailRole}' but '${role}' was provided.`,
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

    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role,
      universityId,
      phoneNumber,
    };

    // Add role-specific fields
    if (["student", "staff", "ta", "professor"].includes(role)) {
      userData.department = department;
    }
    if (role === "student") {
      userData.yearOfStudy = yearOfStudy;
    }

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id, "user");

    // Update login tracking
    await user.updateLastLogin();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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

    // Create vendor
    const vendor = await Vendor.create({
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
      servicesOffered: servicesOffered || [],
      interestedEventTypes,
    });

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
      account = await User.findByEmail(email).select("+password");
      accountType = "user";
    }

    // Check if account exists
    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!account.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is inactive. Please contact support.",
      });
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

module.exports = {
  registerUser,
  registerVendor,
  login,
  logout,
  getProfile,
};
