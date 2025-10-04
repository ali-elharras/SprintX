const mongoose = require("mongoose");
const User = require("../models/User");



const createAdminOrEventOffice = async (req, res) => {
  try {
    const { firstName, lastName, email, password, universityId, role } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !universityId || !role) {
      return res.status(400).json({ message: "All required fields must be provided" });
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
    });

    return res.status(201).json({
      message: `${role === "admin" ? "Admin" : "Event office"} created successfully`,
      user: {
        id: newUser._id,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error creating admin/event office:", error);
    return res.status(500).json({ message: "Server error" });
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





module.exports = {
  createAdminOrEventOffice,
  deleteAdminOrEventOffice,
};