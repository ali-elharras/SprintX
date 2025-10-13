const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

const createAdminAccounts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Admin accounts to create
    const adminAccounts = [
      {
        firstName: "Events",
        lastName: "Office",
        email: "eventsoffice@guc.edu.eg",
        password: "Guc12345",
        role: "events_office",
        universityId: "EO001",
        isVerified: true,
        isRegistrationComplete: true,
      },
      {
        firstName: "System",
        lastName: "Administrator",
        email: "admin@guc.edu.eg",
        password: "Guc12345",
        role: "admin",
        universityId: "ADM001",
        isVerified: true,
        isRegistrationComplete: true,
      },
    ];

    for (const accountData of adminAccounts) {
      // Check if user already exists
      const existingUser = await User.findByEmail(accountData.email);

      if (existingUser) {
        console.log(
          `⚠️  User with email ${accountData.email} already exists, skipping...`
        );
        continue;
      }

      // Check if university ID already exists
      const existingUniversityId = await User.findByUniversityId(
        accountData.universityId
      );

      if (existingUniversityId) {
        console.log(
          `⚠️  University ID ${accountData.universityId} already exists, skipping...`
        );
        continue;
      }

      // Create the user
      const user = await User.create(accountData);
      console.log(
        `✅ Created ${accountData.role} account: ${accountData.email} (ID: ${user._id})`
      );
    }

    console.log("\n🎉 Admin account creation completed!");
  } catch (error) {
    console.error("❌ Error creating admin accounts:", error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("📝 Database connection closed");
    process.exit(0);
  }
};

// Run the script
createAdminAccounts();
