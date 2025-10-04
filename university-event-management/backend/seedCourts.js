const mongoose = require("mongoose");
require("dotenv").config();

const Court = require("./models/Court");
const User = require("./models/User");

// Sample courts data
const sampleCourts = [
  {
    name: "Champions Basketball Arena",
    type: "basketball",
    description: "State-of-the-art basketball arena with professional NBA-standard wooden flooring, retractable seating for 200 spectators, and championship-grade lighting system. Features advanced ventilation and acoustic design for optimal playing conditions.",
    location: "Athletic Center - Building A",
    building: "Athletic Center",
    floor: "Second Floor",
    capacity: 50,
    surface: "indoor_court",
    dimensions: {
      length: 28,
      width: 15,
      unit: "meters"
    },
    facilities: [
      "lighting",
      "changing_rooms",
      "showers",
      "lockers",
      "seating",
      "scoreboard",
      "sound_system",
      "first_aid",
      "parking",
      "accessible",
      "equipment_rental"
    ],
    equipmentAvailable: ["balls", "first_aid_kit", "whistle"],
    operatingHours: {
      monday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      tuesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      wednesday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      thursday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      friday: { isOpen: true, openTime: "06:00", closeTime: "22:00" },
      saturday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
      sunday: { isOpen: true, openTime: "08:00", closeTime: "20:00" }
    },
    slotDuration: 60,
    bookingRules: {
      advanceBookingDays: 7,
      maxBookingDuration: 2,
      maxDailyBookings: 2,
      cancellationDeadline: 2
    },
    pricing: {
      hourlyRate: 75,
      currency: "EGP",
      studentDiscount: 25,
      staffDiscount: 15
    },
    status: "active",
    contactInfo: {
      phone: "+20-10-123-4567",
      email: "champions.court@university.edu"
    },
    rules: "Professional basketball shoes required. No food or drinks on court. Maximum 10 players per booking. Court shoes must be non-marking. Proper athletic attire mandatory."
  },
  {
    name: "Wimbledon Clay Court #1",
    type: "tennis",
    description: "Premium clay tennis court modeled after Roland Garros with imported French clay surface. Features professional-grade LED lighting system for evening matches and temperature-controlled player lounges. Perfect for competitive matches and training.",
    location: "Tennis Academy - East Campus",
    building: "Tennis Academy",
    capacity: 32,
    surface: "clay",
    dimensions: {
      length: 23.77,
      width: 8.23,
      unit: "meters"
    },
    facilities: [
      "lighting",
      "changing_rooms",
      "seating",
      "equipment_rental",
      "parking",
      "refreshments",
      "showers",
      "lockers"
    ],
    equipmentAvailable: ["rackets", "balls", "nets"],
    operatingHours: {
      monday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      tuesday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      wednesday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      thursday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      friday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      saturday: { isOpen: true, openTime: "07:00", closeTime: "19:00" },
      sunday: { isOpen: true, openTime: "07:00", closeTime: "19:00" }
    },
    slotDuration: 90,
    bookingRules: {
      advanceBookingDays: 14,
      maxBookingDuration: 3,
      maxDailyBookings: 1,
      cancellationDeadline: 4
    },
    pricing: {
      hourlyRate: 120,
      currency: "EGP",
      studentDiscount: 30,
      staffDiscount: 20
    },
    status: "active",
    contactInfo: {
      phone: "+20-10-234-5678",
      email: "tennis.academy@university.edu"
    },
    rules: "Tennis shoes with appropriate sole required. Court shoes must be clay-court specific. Maximum 4 players (doubles). Racket rental available at reception. Please brush lines after play."
  },
  {
    name: "Center Court Hard Surface",
    type: "tennis",
    description: "Championship hard court with DecoTurf surface used in professional tournaments. Features electronic line-calling system, player challenges, and live streaming capability for important matches. Spectator seating for 80 people.",
    location: "Tennis Academy - East Campus",
    building: "Tennis Academy",
    capacity: 24,
    surface: "hardcourt",
    dimensions: {
      length: 23.77,
      width: 8.23,
      unit: "meters"
    },
    facilities: [
      "lighting",
      "changing_rooms",
      "seating",
      "equipment_rental",
      "scoreboard",
      "sound_system"
    ],
    equipmentAvailable: ["rackets", "balls", "nets"],
    operatingHours: {
      monday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      tuesday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      wednesday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      thursday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      friday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      saturday: { isOpen: true, openTime: "07:00", closeTime: "19:00" },
      sunday: { isOpen: true, openTime: "07:00", closeTime: "19:00" }
    },
    slotDuration: 90,
    bookingRules: {
      advanceBookingDays: 14,
      maxBookingDuration: 3,
      maxDailyBookings: 1,
      cancellationDeadline: 4
    },
    pricing: {
      hourlyRate: 100,
      currency: "EGP",
      studentDiscount: 25,
      staffDiscount: 15
    },
    status: "active",
    contactInfo: {
      phone: "+20-10-234-5678",
      email: "tennis.academy@university.edu"
    },
    rules: "Hard court tennis shoes required. Maximum 4 players (doubles). Court reservation includes ball machine access. Professional coaching available on request."
  },
  {
    name: "Stadium Football Pitch",
    type: "football",
    description: "FIFA-standard natural grass football field with underground heating system and professional drainage. Features electronic scoreboard, VAR system, and broadcast-quality floodlighting. Home to university's varsity team with capacity for 500 spectators.",
    location: "University Stadium - Central Campus",
    building: "University Stadium",
    capacity: 100,
    surface: "grass",
    dimensions: {
      length: 105,
      width: 68,
      unit: "meters"
    },
    facilities: [
      "lighting",
      "changing_rooms",
      "showers",
      "lockers",
      "seating",
      "scoreboard",
      "sound_system",
      "first_aid",
      "parking",
      "accessible",
      "refreshments"
    ],
    equipmentAvailable: ["balls", "goals", "cones", "bibs", "first_aid_kit", "whistle"],
    operatingHours: {
      monday: { isOpen: true, openTime: "06:00", closeTime: "20:00" },
      tuesday: { isOpen: true, openTime: "06:00", closeTime: "20:00" },
      wednesday: { isOpen: true, openTime: "06:00", closeTime: "20:00" },
      thursday: { isOpen: true, openTime: "06:00", closeTime: "20:00" },
      friday: { isOpen: true, openTime: "06:00", closeTime: "20:00" },
      saturday: { isOpen: true, openTime: "07:00", closeTime: "18:00" },
      sunday: { isOpen: true, openTime: "07:00", closeTime: "18:00" }
    },
    slotDuration: 120,
    bookingRules: {
      advanceBookingDays: 10,
      maxBookingDuration: 4,
      maxDailyBookings: 1,
      cancellationDeadline: 6
    },
    pricing: {
      hourlyRate: 300,
      currency: "EGP",
      studentDiscount: 40,
      staffDiscount: 25
    },
    status: "active",
    contactInfo: {
      phone: "+20-10-345-6789",
      email: "stadium@university.edu"
    },
    rules: "Football boots required with appropriate studs. Minimum 14 players (7v7), maximum 22 players. Professional referee available on request. Medical staff on standby during matches."
  },
  {
    name: "Training Ground Alpha",
    type: "football",
    description: "Modern artificial turf training facility with FIFA Quality Pro certification. Features multi-goal setup for skill development, tactical training areas, and ball return systems. Ideal for practice sessions, small-sided games, and youth development.",
    location: "Sports Complex - West Wing",
    building: "Sports Complex",
    capacity: 80,
    surface: "artificial_turf",
    dimensions: {
      length: 80,
      width: 50,
      unit: "meters"
    },
    facilities: [
      "lighting",
      "changing_rooms",
      "first_aid",
      "parking",
      "equipment_rental"
    ],
    equipmentAvailable: ["balls", "goals", "cones", "bibs"],
    operatingHours: {
      monday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      tuesday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      wednesday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      thursday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      friday: { isOpen: true, openTime: "06:00", closeTime: "21:00" },
      saturday: { isOpen: true, openTime: "08:00", closeTime: "19:00" },
      sunday: { isOpen: true, openTime: "08:00", closeTime: "19:00" }
    },
    slotDuration: 90,
    bookingRules: {
      advanceBookingDays: 7,
      maxBookingDuration: 3,
      maxDailyBookings: 2,
      cancellationDeadline: 3
    },
    pricing: {
      hourlyRate: 180,
      currency: "EGP",
      studentDiscount: 35,
      staffDiscount: 20
    },
    status: "active",
    contactInfo: {
      phone: "+20-10-456-7890",
      email: "training@university.edu"
    },
    rules: "Turf boots or trainers required. Small-sided games (5v5 to 9v9) recommended. Training equipment provided. Coaching sessions available by appointment."
  },
  {
    name: "Recreation Basketball Court",
    type: "basketball",
    description: "Community-style basketball court perfect for pickup games and casual play. Features outdoor-quality flooring suitable for all weather conditions, adjustable height hoops for different skill levels, and a relaxed atmosphere ideal for recreational players.",
    location: "Recreation Center - South Campus",
    building: "Recreation Center",
    floor: "Ground Level",
    capacity: 40,
    surface: "indoor_court",
    dimensions: {
      length: 28,
      width: 15,
      unit: "meters"
    },
    facilities: [
      "lighting",
      "changing_rooms",
      "lockers",
      "first_aid",
      "accessible",
      "parking"
    ],
    equipmentAvailable: ["balls", "first_aid_kit"],
    operatingHours: {
      monday: { isOpen: true, openTime: "07:00", closeTime: "21:00" },
      tuesday: { isOpen: true, openTime: "07:00", closeTime: "21:00" },
      wednesday: { isOpen: true, openTime: "07:00", closeTime: "21:00" },
      thursday: { isOpen: true, openTime: "07:00", closeTime: "21:00" },
      friday: { isOpen: true, openTime: "07:00", closeTime: "21:00" },
      saturday: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
      sunday: { isOpen: false, openTime: "00:00", closeTime: "00:00" }
    },
    slotDuration: 60,
    bookingRules: {
      advanceBookingDays: 5,
      maxBookingDuration: 2,
      maxDailyBookings: 2,
      cancellationDeadline: 2
    },
    pricing: {
      hourlyRate: 45,
      currency: "EGP",
      studentDiscount: 40,
      staffDiscount: 25
    },
    status: "active",
    contactInfo: {
      phone: "+20-10-567-8901",
      email: "recreation@university.edu"
    },
    rules: "Casual basketball shoes acceptable. Pickup games welcome. Maximum 10 players per booking. Family-friendly environment. Beginner-friendly coaching available."
  },
  {
    name: "Practice Tennis Court",
    type: "tennis",
    description: "Entry-level tennis court with synthetic grass surface, perfect for beginners and casual players. Features lower-cost access, group lesson capabilities, and relaxed booking policies. Ideal for students new to tennis or recreational play.",
    location: "Student Recreation Area - North Campus",
    building: "Student Center",
    capacity: 16,
    surface: "artificial_turf",
    dimensions: {
      length: 23.77,
      width: 8.23,
      unit: "meters"
    },
    facilities: [
      "lighting",
      "changing_rooms",
      "equipment_rental"
    ],
    equipmentAvailable: ["rackets", "balls", "nets"],
    operatingHours: {
      monday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
      tuesday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
      wednesday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
      thursday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
      friday: { isOpen: true, openTime: "08:00", closeTime: "20:00" },
      saturday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
      sunday: { isOpen: true, openTime: "09:00", closeTime: "17:00" }
    },
    slotDuration: 60,
    bookingRules: {
      advanceBookingDays: 5,
      maxBookingDuration: 2,
      maxDailyBookings: 2,
      cancellationDeadline: 2
    },
    pricing: {
      hourlyRate: 60,
      currency: "EGP",
      studentDiscount: 50,
      staffDiscount: 30
    },
    status: "active",
    contactInfo: {
      phone: "+20-10-678-9012",
      email: "student.tennis@university.edu"
    },
    rules: "Any athletic shoes acceptable. Beginner lessons available. Racket rental included in booking. Maximum 4 players. Group bookings welcome."
  },
  {
    name: "Futsal Arena",
    type: "football",
    description: "Indoor futsal court with specialized flooring and FIFA futsal goal dimensions. Perfect for 5-a-side games, technical skill development, and fast-paced matches. Features rebound walls and professional futsal balls for authentic gameplay experience.",
    location: "Indoor Sports Complex - Central Campus",
    building: "Indoor Sports Complex",
    floor: "First Floor",
    capacity: 30,
    surface: "indoor_court",
    dimensions: {
      length: 40,
      width: 20,
      unit: "meters"
    },
    facilities: [
      "lighting",
      "changing_rooms",
      "showers",
      "seating",
      "equipment_rental",
      "first_aid"
    ],
    equipmentAvailable: ["balls", "goals", "cones", "bibs"],
    operatingHours: {
      monday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
      tuesday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
      wednesday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
      thursday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
      friday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
      saturday: { isOpen: true, openTime: "10:00", closeTime: "20:00" },
      sunday: { isOpen: true, openTime: "10:00", closeTime: "20:00" }
    },
    slotDuration: 60,
    bookingRules: {
      advanceBookingDays: 7,
      maxBookingDuration: 2,
      maxDailyBookings: 2,
      cancellationDeadline: 2
    },
    pricing: {
      hourlyRate: 150,
      currency: "EGP",
      studentDiscount: 30,
      staffDiscount: 20
    },
    status: "active",
    contactInfo: {
      phone: "+20-10-789-0123",
      email: "futsal@university.edu"
    },
    rules: "Indoor football shoes required. 5v5 format recommended. Futsal balls provided. Rebound walls in play. Technical skills training available."
  }
];

const seedCourts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Find an admin user to set as manager/creator
    let adminUser = await User.findOne({ role: "admin" });
    
    if (!adminUser) {
      console.log("⚠️  No admin user found. Creating a default admin user...");
      adminUser = await User.create({
        firstName: "System",
        lastName: "Administrator",
        email: "admin@university.edu",
        password: "admin123456",
        role: "admin",
        universityId: "ADMIN001",
        isVerified: true,
      });
      console.log("✅ Created default admin user");
    }

    // Clear existing courts
    await Court.deleteMany({});
    console.log("🗑️  Cleared existing courts");

    // Add manager and createdBy to each court
    const courtsWithManager = sampleCourts.map(court => ({
      ...court,
      manager: adminUser._id,
      createdBy: adminUser._id,
    }));

    // Insert sample courts
    const courts = await Court.insertMany(courtsWithManager);
    console.log(`✅ Created ${courts.length} sample courts with enhanced data and photos`);

    // Display created courts
    courts.forEach(court => {
      console.log(`  - ${court.name} (${court.type}) - ${court.location}`);
      console.log(`    📸 ${court.images.length} photos included`);
      console.log(`    💰 ${court.pricing.hourlyRate} EGP/hour (${court.pricing.studentDiscount}% student discount)`);
    });

    console.log("\n🎉 Enhanced court seeding completed successfully!");
    console.log("\nFeatures included:");
    console.log("  - High-quality sports facility photos from Unsplash");
    console.log("  - Detailed descriptions with professional amenities");
    console.log("  - Realistic pricing with student discounts");
    console.log("  - Comprehensive facility information");
    console.log("  - Professional contact information");
    console.log("  - Detailed booking rules and operating hours");
    console.log("\nAPI Endpoints:");
    console.log("  - View all courts: GET /api/courts");
    console.log("  - View basketball courts: GET /api/courts/type/basketball");
    console.log("  - View tennis courts: GET /api/courts/type/tennis");
    console.log("  - View football courts: GET /api/courts/type/football");
    console.log("  - Check availability: GET /api/courts/:id/availability/2025-10-15");
    console.log("  - Get court stats: GET /api/courts/stats");

  } catch (error) {
    console.error("❌ Error seeding courts:", error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
    process.exit(0);
  }
};

// Run the seeding function
if (require.main === module) {
  seedCourts();
}

module.exports = { seedCourts, sampleCourts };