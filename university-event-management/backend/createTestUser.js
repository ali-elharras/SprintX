const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function createTestAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("✅ Admin user already exists:", existingAdmin.email);
      return existingAdmin;
    }

    // Create test admin user
    const adminUser = await User.create({
      firstName: "Test",
      lastName: "Admin",
      email: "admin@university.edu",
      password: "admin123456",
      role: "admin",
      universityId: "ADMIN001",
      department: "Administration",
      phoneNumber: "+1-555-123-4567",
      isVerified: true,
      isActive: true,
    });

    console.log("✅ Test admin user created successfully!");
    console.log("📧 Email: admin@university.edu");
    console.log("🔑 Password: admin123456");
    
    return adminUser;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the script
if (require.main === module) {
  createTestAdmin();
}

module.exports = { createTestAdmin };