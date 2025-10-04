const mongoose = require("mongoose");
const GymSession = require("./models/GymSession");
const User = require("./models/User");
require("dotenv").config();

// Sample gym sessions data
const sampleGymSessions = [
  {
    title: "Morning Power Yoga",
    description: "Start your day with energizing yoga flows to build strength and flexibility.",
    type: "yoga",
    instructor: {
      name: "Sarah Johnson",
      email: "sarah.j@university.edu",
      bio: "Certified yoga instructor with 8 years of experience in Hatha and Vinyasa yoga.",
      certifications: ["RYT-500", "Yin Yoga Certified"],
    },
    dayOfWeek: 1, // Monday
    startTime: "07:00",
    endTime: "08:00",
    duration: 60,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    location: "Fitness Center",
    room: "Studio A",
    equipment: ["Yoga mats", "Blocks", "Straps"],
    maxParticipants: 25,
    currentParticipants: 18,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    skillLevel: "all_levels",
    status: "active",
    prerequisites: "No previous yoga experience required",
    benefits: ["Improved flexibility", "Stress reduction", "Better posture", "Increased strength"],
    calories: 180,
    cost: 0,
    tags: ["morning", "beginner-friendly", "stress-relief"],
  },
  {
    title: "High-Intensity Cardio Blast",
    description: "Get your heart pumping with this high-energy cardio workout.",
    type: "cardio",
    instructor: {
      name: "Mike Rodriguez",
      email: "mike.r@university.edu",
      bio: "ACSM certified personal trainer specializing in HIIT and cardio conditioning.",
      certifications: ["ACSM-CPT", "HIIT Specialist"],
    },
    dayOfWeek: 2, // Tuesday
    startTime: "18:00",
    endTime: "19:00",
    duration: 60,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    location: "Fitness Center",
    room: "Main Gym",
    equipment: ["Step platforms", "Dumbbells", "Medicine balls"],
    maxParticipants: 30,
    currentParticipants: 22,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    skillLevel: "intermediate",
    status: "active",
    prerequisites: "Basic fitness level required",
    benefits: ["Cardiovascular health", "Fat burning", "Endurance building", "Mental toughness"],
    calories: 450,
    cost: 5,
    tags: ["evening", "high-intensity", "fat-burning"],
  },
  {
    title: "Beginner Pilates",
    description: "Learn the fundamentals of Pilates with focus on core strength and posture.",
    type: "pilates",
    instructor: {
      name: "Emma Thompson",
      email: "emma.t@university.edu",
      bio: "Classical Pilates instructor certified through Romana's Pilates.",
      certifications: ["Classical Pilates Comprehensive", "Prenatal Pilates"],
    },
    dayOfWeek: 3, // Wednesday
    startTime: "12:00",
    endTime: "13:00",
    duration: 60,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    location: "Fitness Center",
    room: "Studio B",
    equipment: ["Pilates mats", "Resistance bands", "Pilates balls"],
    maxParticipants: 20,
    currentParticipants: 15,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    skillLevel: "beginner",
    status: "active",
    prerequisites: "None",
    benefits: ["Core strength", "Better posture", "Injury prevention", "Body awareness"],
    calories: 200,
    cost: 0,
    tags: ["lunch-time", "beginner", "core-strength"],
  },
  {
    title: "Zumba Dance Fitness",
    description: "Dance your way to fitness with Latin-inspired moves and upbeat music.",
    type: "zumba",
    instructor: {
      name: "Carlos Martinez",
      email: "carlos.m@university.edu",
      bio: "Licensed Zumba instructor bringing 5 years of dance and fitness experience.",
      certifications: ["Zumba Basic 1", "Zumba Toning", "Strong by Zumba"],
    },
    dayOfWeek: 4, // Thursday
    startTime: "19:00",
    endTime: "20:00",
    duration: 60,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    location: "Fitness Center",
    room: "Dance Studio",
    equipment: ["Sound system", "Water station"],
    maxParticipants: 35,
    currentParticipants: 28,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    skillLevel: "all_levels",
    status: "active",
    prerequisites: "No dance experience required",
    benefits: ["Cardiovascular fitness", "Coordination", "Mood boost", "Fun workout"],
    calories: 350,
    cost: 3,
    tags: ["evening", "dance", "fun", "social"],
  },
  {
    title: "CrossFit Circuit Training",
    description: "Functional fitness combining strength, cardio, and mobility work.",
    type: "cross_circuit",
    instructor: {
      name: "David Kim",
      email: "david.k@university.edu",
      bio: "CrossFit Level 2 trainer with background in strength and conditioning.",
      certifications: ["CrossFit Level 2", "USA Weightlifting Sports Performance Coach"],
    },
    dayOfWeek: 5, // Friday
    startTime: "17:00",
    endTime: "18:00",
    duration: 60,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    location: "Fitness Center",
    room: "Functional Training Area",
    equipment: ["Barbells", "Kettlebells", "Pull-up bars", "Plyo boxes"],
    maxParticipants: 15,
    currentParticipants: 12,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    skillLevel: "intermediate",
    status: "active",
    prerequisites: "Basic weightlifting knowledge recommended",
    benefits: ["Functional strength", "Athletic performance", "Mental toughness", "Community"],
    calories: 500,
    cost: 10,
    tags: ["evening", "strength", "functional", "challenging"],
  },
  {
    title: "Kickboxing Fundamentals",
    description: "Learn basic kickboxing techniques while getting an intense workout.",
    type: "kickboxing",
    instructor: {
      name: "Lisa Chen",
      email: "lisa.c@university.edu",
      bio: "Martial arts instructor with black belt in Taekwondo and kickboxing certification.",
      certifications: ["Certified Kickboxing Instructor", "Taekwondo 3rd Dan"],
    },
    dayOfWeek: 6, // Saturday
    startTime: "10:00",
    endTime: "11:00",
    duration: 60,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    location: "Fitness Center",
    room: "Martial Arts Room",
    equipment: ["Heavy bags", "Focus mitts", "Hand wraps"],
    maxParticipants: 20,
    currentParticipants: 16,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    skillLevel: "beginner",
    status: "active",
    prerequisites: "None - beginners welcome",
    benefits: ["Self-defense skills", "Stress relief", "Coordination", "Confidence"],
    calories: 400,
    cost: 5,
    tags: ["weekend", "martial-arts", "stress-relief", "beginner"],
  },
  {
    title: "Sunday Stretch & Recovery",
    description: "Gentle stretching and mobility work to help your body recover and prepare for the week.",
    type: "yoga",
    instructor: {
      name: "Jennifer Walsh",
      email: "jennifer.w@university.edu",
      bio: "Restorative yoga and stretching specialist focused on recovery and wellness.",
      certifications: ["RYT-200", "Restorative Yoga Certified", "Myofascial Release"],
    },
    dayOfWeek: 0, // Sunday
    startTime: "16:00",
    endTime: "17:00",
    duration: 60,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    location: "Fitness Center",
    room: "Studio A",
    equipment: ["Yoga mats", "Bolsters", "Blankets", "Essential oils"],
    maxParticipants: 25,
    currentParticipants: 20,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    skillLevel: "all_levels",
    status: "active",
    prerequisites: "None",
    benefits: ["Stress reduction", "Improved flexibility", "Better sleep", "Mental clarity"],
    calories: 120,
    cost: 0,
    tags: ["weekend", "recovery", "relaxation", "gentle"],
  },
  {
    title: "Strength Training Basics",
    description: "Learn proper form and technique for fundamental strength training exercises.",
    type: "strength_training",
    instructor: {
      name: "Robert Johnson",
      email: "robert.j@university.edu",
      bio: "NSCA certified strength and conditioning coach with 10 years experience.",
      certifications: ["NSCA-CSCS", "FMS Level 2", "Precision Nutrition Level 1"],
    },
    dayOfWeek: 2, // Tuesday
    startTime: "12:00",
    endTime: "13:00",
    duration: 60,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    location: "Fitness Center",
    room: "Weight Room",
    equipment: ["Barbells", "Dumbbells", "Squat racks", "Benches"],
    maxParticipants: 12,
    currentParticipants: 8,
    eligibleRoles: ["student", "staff", "ta", "professor"],
    skillLevel: "beginner",
    status: "active",
    prerequisites: "None - perfect for beginners",
    benefits: ["Increased strength", "Bone density", "Metabolism boost", "Confidence"],
    calories: 300,
    cost: 0,
    tags: ["lunch-time", "beginner", "strength", "fundamentals"],
  },
];

const seedGymSessions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Find a sample user to use as creator
    const sampleUser = await User.findOne({ role: "admin" });
    if (!sampleUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    // Clear existing gym sessions
    await GymSession.deleteMany({});
    console.log("🗑️  Cleared existing gym sessions");

    // Add creator to each session
    const sessionsWithCreator = sampleGymSessions.map(session => ({
      ...session,
      createdBy: sampleUser._id,
    }));

    // Insert sample sessions
    const createdSessions = await GymSession.insertMany(sessionsWithCreator);
    console.log(`✅ Created ${createdSessions.length} gym sessions`);

    // Display summary
    console.log("\n📊 Summary of created sessions:");
    const sessionsByType = createdSessions.reduce((acc, session) => {
      acc[session.type] = (acc[session.type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(sessionsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} sessions`);
    });

    console.log("\n✅ Gym session seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding gym sessions:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

// Run the seeding function
if (require.main === module) {
  seedGymSessions();
}

module.exports = { seedGymSessions, sampleGymSessions };