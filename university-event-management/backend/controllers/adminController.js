const mongoose = require("mongoose");
const User = require("../models/User");

const createAdminOrEventOffice = async (req, res) => {
  try {
    const { firstName, lastName, email, password, universityId, role } =
      req.body;

    // Validate required fields (universityId is optional for admin/events_office)
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Normalize role alias and validate (DB enum uses 'events_office')
    const normalizedRole = role === "event_office" ? "events_office" : role;
    if (!["admin", "events_office"].includes(normalizedRole)) {
      return res
        .status(400)
        .json({ message: "Role must be 'admin' or 'events_office'" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Create new user
    const payload = {
      firstName,
      lastName,
      email,
      password,
      role: normalizedRole,
      isVerified: true, // Admins/Event office are verified immediately
      isActive: true, // Explicitly set active
    };

    // Only set universityId if it's provided and not empty
    if (universityId && universityId.trim()) {
      payload.universityId = universityId.trim();
    }
    // Note: We don't set universityId at all if not provided, so it remains undefined

    const newUser = await User.create(payload);

    return res.status(201).json({
      message: `${
        role === "admin" ? "Admin" : "Event Office"
      } created successfully`,
      user: {
        id: newUser._id,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin/event office:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deleteAdminOrEventOffice = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if user is admin or event office
    if (user.role !== "admin" && user.role !== "event_office") {
      return res
        .status(400)
        .json({ message: "User is not an admin or event office" });
    }

    // Delete the account
    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Admin/Event Office account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users with selected fields only (no password or sensitive tokens)
    const users = await User.find(
      {},
      "firstName lastName email role universityId department yearOfStudy phoneNumber isActive isVerified createdAt"
    ).lean();

    // Format output to make it frontend-friendly
    const formattedUsers = users.map((user) => ({
      id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      universityId: user.universityId,
      department: user.department || "N/A",
      yearOfStudy: user.yearOfStudy || "N/A",
      phoneNumber: user.phoneNumber || "N/A",
      status: user.isActive ? "Active" : "Blocked",
      verified: user.isVerified,
      createdAt: user.createdAt.toLocaleDateString(),
    }));

    res.status(200).json(formattedUsers);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Fetch academics (staff/ta/professor) who registered but are not yet verified
const getPendingAcademics = async (req, res) => {
  try {
    const users = await User.find(
      {
        isVerified: false,
        role: { $in: ["staff", "ta", "professor"] },
      },
      "firstName lastName email universityId role createdAt"
    ).sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching pending academics:", err);
    res.status(500).json({ message: "Error fetching pending academics" });
  }
};

// Approve academic by setting the correct role, generating verification token, and emailing the user
const approveAcademic = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // expected: staff, ta, professor

    if (!["staff", "ta", "professor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update role, ensure verification is pending until email link is clicked
    user.role = role;
    user.isVerified = false;

    // Generate verification token
    const crypto = require("crypto");
    const verifyToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verifyToken;
    user.verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await user.save();

    // Send verification email
    const emailService = require("../services/emailService");
    try {
      await emailService.sendVerificationEmail(
        user.verificationEmail,
        verifyToken,
        `${user.firstName} ${user.lastName}`,
        role
      );

      // Mark email as sent on successful sending
      user.emailVerificationSent = true;
      await user.save();
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr.message);
      // We keep the approval saved but inform the admin email failed
      return res.status(200).json({
        message:
          "User approved. Verification email could not be sent. You may need to resend later.",
        user: {
          id: user._id,
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          emailVerificationSent: user.emailVerificationSent,
        },
      });
    }

    return res.status(200).json({
      message:
        "User approved. Verification email sent. The user must click the link to activate their account.",
      user: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        emailVerificationSent: user.emailVerificationSent,
      },
    });
  } catch (err) {
    console.error("Error approving academic:", err);
    res.status(500).json({ message: "Error approving user" });
  }
};

module.exports = {
  createAdminOrEventOffice,
  deleteAdminOrEventOffice,
  getAllUsers,
  getPendingAcademics,
  approveAcademic,
};
