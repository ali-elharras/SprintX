const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

async function createTestStudent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Check if test student already exists
    const existingStudent = await User.findOne({ email: "student@university.edu" });
    if (existingStudent) {
      console.log("✅ Test student user already exists:", existingStudent.email);
      return existingStudent;
    }

    // Create test student user
    const studentUser = await User.create({
      firstName: "Test",
      lastName: "Student",
      email: "student@university.edu",
      password: "student123456",
      role: "student",
      universityId: "STU001",
      department: "Computer Science",
      yearOfStudy: 3,
      phoneNumber: "+1-555-987-6543",
      isVerified: true,
      isActive: true,
    });

    console.log("✅ Test student user created successfully!");
    console.log("📧 Email: student@university.edu");
    console.log("🔑 Password: student123456");
    console.log("🎓 Role: student");
    console.log("🏫 Department: Computer Science");
    
    return studentUser;
  } catch (error) {
    console.error("❌ Error creating student user:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the script
if (require.main === module) {
  createTestStudent();
}

module.exports = { createTestStudent };