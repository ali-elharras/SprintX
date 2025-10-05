const mongoose = require("mongoose");
require("dotenv").config();

// Import User model
const User = require("../models/User");

const seedAdminUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@admin.guc.edu.eg",
    });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists");
    } else {
      // Create admin user
      const adminUser = new User({
        firstName: "System",
        lastName: "Administrator",
        email: "admin@admin.guc.edu.eg",
        password: "Admin123!", // Will be hashed by pre-save middleware
        role: "admin",
        universityId: "999001",
        department: "Administration",
        isActive: true,
        isVerified: true,
        emailNotifications: true,
        smsNotifications: false,
      });
      await adminUser.save();
      console.log("✅ Admin user created successfully");
      console.log("   📧 Email: admin@admin.guc.edu.eg");
      console.log("   🔑 Password: Admin123!");
    }

    // Check if events office already exists
    const existingEventsOffice = await User.findOne({
      email: "manager@eventsoffice.guc.edu.eg",
    });
    if (existingEventsOffice) {
      console.log("⚠️ Events Office user already exists");
    } else {
      // Create events office user
      const eventsOfficeUser = new User({
        firstName: "Events",
        lastName: "Office Manager",
        email: "manager@eventsoffice.guc.edu.eg",
        password: "Events123!", // Will be hashed by pre-save middleware
        role: "events_office",
        universityId: "999002",
        department: "Events Management",
        isActive: true,
        isVerified: true,
        emailNotifications: true,
        smsNotifications: false,
      });
      await eventsOfficeUser.save();
      console.log("✅ Events Office user created successfully");
      console.log("   📧 Email: manager@eventsoffice.guc.edu.eg");
      console.log("   🔑 Password: Events123!");
    }

    console.log("🎉 Seed process completed");
    console.log("");
    console.log("📋 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👑 ADMIN LOGIN:");
    console.log("   Email: admin@admin.guc.edu.eg");
    console.log("   Password: Admin123!");
    console.log("");
    console.log("🎪 EVENTS OFFICE LOGIN:");
    console.log("   Email: manager@eventsoffice.guc.edu.eg");
    console.log("   Password: Events123!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin users:", error);
    process.exit(1);
  }
};

seedAdminUsers();
