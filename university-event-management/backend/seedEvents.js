const mongoose = require("mongoose");
const Event = require("./models/Event");
const User = require("./models/User");
require("dotenv").config();

// Sample events data
const sampleEvents = [
  {
    title: "React Workshop: Building Modern Web Applications",
    description: "Learn the fundamentals of React.js and build your first modern web application. This hands-on workshop covers components, state management, hooks, and more. Perfect for beginners and intermediate developers looking to enhance their skills.",
    type: "workshop",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
    location: "Computer Science Building, Room 201",
    venue: "CS Building Lab",
    registrationRequired: true,
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    maxParticipants: 25,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    status: "published",
    instructor: "Dr. Sarah Johnson",
    duration: 4,
    cost: 0,
    prerequisites: "Basic knowledge of HTML, CSS, and JavaScript",
    materials: "Laptop required. Development environment setup instructions will be provided.",
    tags: ["react", "web development", "javascript", "frontend"],
  },
  {
    title: "University Trip to Tech Valley",
    description: "Join us for an exciting educational trip to Tech Valley to visit major technology companies including Google, Apple, and several innovative startups. This trip includes company tours, networking sessions, and career guidance talks.",
    type: "trip",
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 3 days trip
    location: "Silicon Valley, California",
    venue: "Various Tech Companies",
    registrationRequired: true,
    registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    maxParticipants: 30,
    eligibleRoles: ["student", "ta", "professor"],
    eligibleDepartments: ["Computer Science", "Information Technology", "Engineering"],
    status: "published",
    itinerary: "Day 1: Google HQ tour and tech talk, Day 2: Apple campus visit and innovation workshop, Day 3: Startup visits and networking events",
    transportation: "Charter bus with Wi-Fi and refreshments provided",
    cost: 350,
    tags: ["tech", "industry visit", "networking", "career development"],
  },
  {
    title: "AI and Machine Learning Workshop",
    description: "Dive into the world of Artificial Intelligence and Machine Learning. Learn about neural networks, deep learning, and practical applications. Hands-on exercises with Python and popular ML libraries.",
    type: "workshop",
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours later
    location: "Engineering Building, Room 305",
    venue: "AI Lab",
    registrationRequired: true,
    registrationDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
    maxParticipants: 20,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    status: "published",
    instructor: "Prof. Michael Chen",
    duration: 6,
    cost: 25,
    prerequisites: "Basic programming knowledge in Python. Linear algebra and statistics recommended.",
    materials: "Laptop with Python 3.8+ installed. GPU access will be provided for training models.",
    tags: ["ai", "machine learning", "python", "deep learning"],
  },
  {
    title: "Annual Spring Bazaar",
    description: "Join us for our annual spring bazaar featuring local vendors, student clubs, food trucks, and entertainment. A great opportunity to explore local businesses and university organizations.",
    type: "bazaar",
    startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 hours later
    location: "University Main Quad",
    venue: "Outdoor Event Space",
    registrationRequired: false, // Open event, no registration needed
    maxParticipants: 500,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    status: "published",
    cost: 0,
    tags: ["community", "vendors", "food", "entertainment"],
  },
  {
    title: "Cybersecurity Competition: Capture The Flag",
    description: "Test your cybersecurity skills in this exciting Capture The Flag competition. Teams will solve security challenges ranging from web exploitation to cryptography and reverse engineering.",
    type: "competition",
    startDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000), // 18 days from now
    endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 hours later
    location: "Computer Science Building, Multiple Labs",
    venue: "Cybersecurity Lab",
    registrationRequired: true,
    registrationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    maxParticipants: 60,
    eligibleRoles: ["student", "ta"],
    eligibleDepartments: ["Computer Science", "Information Security", "Information Technology"],
    status: "published",
    cost: 10,
    prerequisites: "Basic knowledge of networking, programming, and security concepts",
    materials: "Laptop required. VPN access and challenge environment will be provided.",
    tags: ["cybersecurity", "ctf", "competition", "hacking"],
  },
];

async function seedEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Find the first admin user to use as organizer
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    console.log(`📝 Using admin user: ${adminUser.firstName} ${adminUser.lastName} as organizer`);

    // Clear existing events
    await Event.deleteMany({});
    console.log("🗑️  Cleared existing events");

    // Add organizer to each event
    const eventsWithOrganizer = sampleEvents.map(event => ({
      ...event,
      organizer: adminUser._id,
      organizerDetails: {
        name: `${adminUser.firstName} ${adminUser.lastName}`,
        email: adminUser.email,
        phone: adminUser.phoneNumber || "+1 (555) 123-4567",
      },
    }));

    // Insert sample events
    const insertedEvents = await Event.insertMany(eventsWithOrganizer);
    console.log(`✅ Inserted ${insertedEvents.length} sample events`);

    // Display summary
    console.log("\n📊 Events Summary:");
    for (const event of insertedEvents) {
      console.log(`- ${event.title} (${event.type}) - ${event.startDate.toLocaleDateString()}`);
    }

    console.log("\n🎉 Sample events seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding events:", error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  seedEvents();
}

module.exports = { sampleEvents, seedEvents };