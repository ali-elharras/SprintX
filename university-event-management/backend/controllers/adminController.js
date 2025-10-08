const mongoose = require("mongoose");
const User = require("../models/User");



const createAdminOrEventOffice = async (req, res) => {
  try {
    const { firstName, lastName, email, password, universityId, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !universityId || !role) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Only allow admin or event_office roles
    if (!["admin", "event_office"].includes(role)) {
      return res.status(400).json({ message: "Role must be admin or event_office" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      universityId,
      role,
      isVerified: true, // Admins/Event office are verified immediately
      isActive: true,   // Explicitly set active
    });

    return res.status(201).json({
      message: `${role === "admin" ? "Admin" : "Event Office"} created successfully`,
      user: {
        id: newUser._id,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin/event office:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const  deleteAdminOrEventOffice= async (req, res)=> {
  try {
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if user is admin or event office
    if (user.role !== "admin" && user.role !== "event_office") {
      return res.status(400).json({ message: "User is not an admin or event office" });
    }

    // Delete the account
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin/Event Office account deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}


const getAllUsers = async (req, res) => {

  try {
    // Fetch all users with selected fields only (no password or sensitive tokens)
    const users = await User.find({}, 
      "firstName lastName email role universityId department yearOfStudy phoneNumber isActive isVerified createdAt"
    ).lean();

    // Format output to make it frontend-friendly
    const formattedUsers = users.map(user => ({
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


const getPendingAcademics = async (req, res) => {
  try {
    const users = await User.find({
      isActive: false,
      role: "pending",
      requestedRole: { $in: ["staff", "ta", "professor"] }
    }, "firstName lastName email universityId requestedRole createdAt");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending academics" });
  }
};

const approveAcademic = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // staff, ta, professor
    if (!["staff", "ta", "professor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      id,
      { role, isActive: true, requestedRole: undefined },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User approved and role assigned" });
  } catch (err) {
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