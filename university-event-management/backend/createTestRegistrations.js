const mongoose = require("mongoose");
const User = require("./models/User");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
require("dotenv").config();

async function createTestRegistrations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Find test student user
    let testStudent = await User.findOne({ email: "student@student.guc.edu.eg" });
    if (!testStudent) {
      // Create test student if doesn't exist
      testStudent = await User.create({
        firstName: "Omar",
        lastName: "Test",
        email: "student@student.guc.edu.eg",
        password: "Password123",
        role: "student",
        universityId: "STU123456",
        department: "Computer Science",
        yearOfStudy: 3,
        phoneNumber: "+1-555-987-6543",
        isVerified: true,
        isActive: true,
      });
      console.log("✅ Created test student user");
    }

    // Find available events
    const events = await Event.find({ status: "published" }).limit(4);
    if (events.length === 0) {
      console.log("❌ No events found. Please run seedEvents.js first.");
      return;
    }

    // Clear existing registrations for this user
    await Registration.deleteMany({ user: testStudent._id });
    console.log("🗑️  Cleared existing registrations for test student");

    // Create some test registrations
    const registrations = [];

    // Register for upcoming events
    for (let i = 0; i < Math.min(2, events.length); i++) {
      const event = events[i];
      
      const registration = await Registration.create({
        event: event._id,
        user: testStudent._id,
        firstName: testStudent.firstName,
        lastName: testStudent.lastName,
        email: testStudent.email,
        universityId: testStudent.universityId,
        role: testStudent.role,
        department: testStudent.department,
        yearOfStudy: testStudent.yearOfStudy,
        phoneNumber: testStudent.phoneNumber,
        status: "confirmed",
        registrationDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        specialRequirements: i === 0 ? "Vegetarian meal preference" : null,
        dietaryRestrictions: i === 1 ? "No nuts please" : null,
      });

      registrations.push(registration);
      console.log(`✅ Registered for upcoming event: ${event.title}`);
    }

    // Create some past events and registrations
    if (events.length > 2) {
      const pastEvents = [];
      
      for (let i = 2; i < Math.min(4, events.length); i++) {
        const event = events[i];
        
        // Make this event in the past
        const pastStartDate = new Date(Date.now() - (i - 1) * 7 * 24 * 60 * 60 * 1000); // Past weeks
        const pastEndDate = new Date(pastStartDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours later
        
        await Event.findByIdAndUpdate(event._id, {
          startDate: pastStartDate,
          endDate: pastEndDate,
        });

        const registration = await Registration.create({
          event: event._id,
          user: testStudent._id,
          firstName: testStudent.firstName,
          lastName: testStudent.lastName,
          email: testStudent.email,
          universityId: testStudent.universityId,
          role: testStudent.role,
          department: testStudent.department,
          yearOfStudy: testStudent.yearOfStudy,
          phoneNumber: testStudent.phoneNumber,
          status: i === 2 ? "attended" : "confirmed",
          registrationDate: new Date(pastStartDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before event
          checkedIn: i === 2 ? true : false,
          checkInTime: i === 2 ? pastStartDate : null,
        });

        registrations.push(registration);
        pastEvents.push(event);
        console.log(`✅ Created past event registration: ${event.title}`);
      }
    }

    console.log(`\n🎉 Created ${registrations.length} test registrations for user: ${testStudent.email}`);
    console.log("📧 You can now login with:");
    console.log("   Email: student@student.guc.edu.eg");
    console.log("   Password: Password123");
    console.log("\n🔗 Navigate to /my-registrations to see the test data");

  } catch (error) {
    console.error("❌ Error creating test registrations:", error);
    console.error(error.stack);
  } finally {
    mongoose.disconnect();
  }
}

// Run the script
if (require.main === module) {
  createTestRegistrations();
}

module.exports = { createTestRegistrations };