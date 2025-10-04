const Event = require("../models/Event");
const User = require("../models/User");

// @desc    Get all upcoming bazaars
// @route   GET /api/events/bazaars/upcoming
// @access  Private (for Vendors)
const getUpcomingBazaars = async (req, res, next) => {
  try {
    const bazaars = await Event.find({
      startDate: { $gte: new Date() },
    }).sort({ startDate: "asc" });

    res.status(200).json({
      success: true,
      count: bazaars.length,
      data: bazaars,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed a sample bazaar (Temporary)
// @route   POST /api/events/seed/bazaar
// @access  Public
const seedBazaar = async (req, res, next) => {
    try {
        // Create a dummy admin user if it doesn't exist
        let admin = await User.findOne({ email: "admin@events.internal" });
        if (!admin) {
            admin = await User.create({
                firstName: "Admin",
                lastName: "User",
                email: "admin@events.internal",
                password: "AdminPassword123",
                role: "admin",
                universityId: "admin001"
            });
        }

        // Create a sample bazaar
        const today = new Date();
        const futureDate = new Date(today.setDate(today.getDate() + 30));

        const bazaar = await Event.create({
            name: "Annual Spring Bazaar",
            description: "A wonderful bazaar with lots of vendors and activities.",
            eventType: "bazaar",
            startDate: futureDate,
            endDate: new Date(futureDate.getTime() + 86400000), // 1 day duration
            location: "University Main Courtyard",
            status: "upcoming",
            organizer: admin._id
        });

        res.status(201).json({
            success: true,
            message: "Sample bazaar created successfully.",
            data: bazaar
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
  getUpcomingBazaars,
  seedBazaar,
};
