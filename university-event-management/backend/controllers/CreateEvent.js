const Event = require("../models/Event");
const { notifyAllUsersAboutNewEvent } = require("./notificationController");

// @desc    Create a new event
// @route   POST /api/events
// @access  Admin (or Public, depending on your app)
exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      location,
      registrationDeadline,
    } = req.body;

    // Validate required fields
    if (!name || !description || !startDate || !endDate || !location || !registrationDeadline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create event
    const newEvent = await Event.create({
      name,
      description,
      startDate,
      endDate,
      location,
      registrationDeadline,
    });

    // Notify all users about the new event
    try {
      await notifyAllUsersAboutNewEvent(newEvent.name, newEvent._id);
    } catch (notifError) {
      console.error('Error notifying users about new event:', notifError);
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: newEvent,
    });
  } catch (error) {
    console.error("❌ Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating event",
      error: error.message,
    });
  }
};
