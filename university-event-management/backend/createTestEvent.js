const mongoose = require("mongoose");
const Event = require("./models/Event");
const User = require("./models/User");
require("dotenv").config();

async function createTestEvent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Find admin user to use as organizer
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("❌ No admin user found. Please run createTestUser.js first.");
      process.exit(1);
    }

    // Create a test event perfect for registration testing
    const testEvent = {
      title: "Registration Testing Workshop - JavaScript Fundamentals",
      description: "A comprehensive workshop designed for testing the registration system. Learn JavaScript fundamentals including variables, functions, objects, and async programming. This event is specifically created with optimal registration settings for testing purposes.",
      type: "workshop",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      location: "Computer Science Building, Room 101",
      venue: "Programming Lab A",
      registrationRequired: true,
      registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      maxParticipants: 15, // Small number for easy testing
      currentParticipants: 0,
      eligibleRoles: ["student", "staff", "ta", "professor"],
      eligibleDepartments: [], // All departments eligible
      status: "published",
      instructor: "Prof. Test Instructor",
      duration: 3,
      cost: 0,
      prerequisites: "No prerequisites required - perfect for testing!",
      materials: "Laptop required. All software will be provided.",
      tags: ["javascript", "programming", "beginner", "testing"],
      organizer: adminUser._id,
      organizerDetails: {
        name: `${adminUser.firstName} ${adminUser.lastName}`,
        email: adminUser.email,
        phone: adminUser.phoneNumber || "+1 (555) 123-4567",
      },
    };

    // Check if this test event already exists
    const existingEvent = await Event.findOne({ 
      title: "Registration Testing Workshop - JavaScript Fundamentals" 
    });
    
    if (existingEvent) {
      console.log("✅ Test event already exists:", existingEvent.title);
      console.log(`📅 Start Date: ${existingEvent.startDate}`);
      console.log(`📝 Registration Deadline: ${existingEvent.registrationDeadline}`);
      console.log(`👥 Max Participants: ${existingEvent.maxParticipants}`);
      console.log(`🎯 Registration Open: ${existingEvent.isRegistrationOpen}`);
      return existingEvent;
    }

    // Create the test event
    const createdEvent = await Event.create(testEvent);
    console.log("✅ Test event created successfully!");
    console.log(`📅 Event: ${createdEvent.title}`);
    console.log(`📅 Start Date: ${createdEvent.startDate}`);
    console.log(`📝 Registration Deadline: ${createdEvent.registrationDeadline}`);
    console.log(`👥 Max Participants: ${createdEvent.maxParticipants}`);
    console.log(`🎯 Registration Open: ${createdEvent.isRegistrationOpen}`);
    console.log(`🆔 Event ID: ${createdEvent._id}`);

    return createdEvent;
  } catch (error) {
    console.error("❌ Error creating test event:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the script
if (require.main === module) {
  createTestEvent();
}

module.exports = { createTestEvent };