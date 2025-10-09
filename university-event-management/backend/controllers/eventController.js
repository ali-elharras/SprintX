const Event = require("../models/Event");
const User = require("../models/User");
const Registration = require("../models/Registration");
const Conference = require("../models/Conference");
const { validationResult } = require("express-validator");

/* --------------------------------------------------------
   BAZAAR-SPECIFIC CONTROLLERS
-------------------------------------------------------- */

// @desc    Get all upcoming bazaars
// @route   GET /api/events/bazaars/upcoming
// @access  Private (for Vendors)
const getUpcomingBazaars = async (req, res, next) => {
  try {
    const bazaars = await Event.find({
      startDate: { $gte: new Date() },
      type: "bazaar",
      status: "published",
    }).sort({ startDate: 1 });

    return res.status(200).json({
      success: true,
      count: bazaars.length,
      data: bazaars,
    });
  } catch (error) {
    console.error("Error fetching upcoming bazaars:", error);
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
        universityId: "admin001",
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
      endDate: new Date(futureDate.getTime() + 86400000), // 1-day duration
      location: "University Main Courtyard",
      status: "upcoming",
      organizer: admin._id,
    });

    res.status(201).json({
      success: true,
      message: "Sample bazaar created successfully.",
      data: bazaar,
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------------------------------
   GENERAL EVENT CONTROLLERS
-------------------------------------------------------- */

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { type, status = "published", upcoming = false } = req.query;

    // Fetch regular events
    let eventQuery = { status };
    let conferenceQuery = {}; // Conferences don't have status field

    if (type) {
      eventQuery.type = type;
      // If specifically asking for conferences, only return conferences
      if (type === "conference") {
        const conferences = await Conference.find(conferenceQuery).sort({ date: 1 });
        return res.status(200).json({
          success: true,
          count: conferences.length,
          data: conferences.map(conf => ({
            ...conf.toObject(),
            type: "conference",
            name: conf.title, // Map title to name for consistency
            startDate: conf.date,
            endDate: conf.date, // Conferences are single-day
            registrationRequired: true,
            status: "published" // Assume conferences are always published
          }))
        });
      }
    }

    if (upcoming === "true") {
      eventQuery.startDate = { $gte: new Date() };
      conferenceQuery.date = { $gte: new Date() };
    }

    // Fetch both regular events and conferences
    const [events, conferences] = await Promise.all([
      Event.find(eventQuery)
        .populate("organizer", "firstName lastName email")
        .sort({ startDate: 1 }),
      upcoming === "true" 
        ? Conference.find({ date: { $gte: new Date() } }).sort({ date: 1 })
        : Conference.find().sort({ date: 1 })
    ]);

    // Combine and transform the data
    const allEvents = [
      ...events,
      ...conferences.map(conf => ({
        ...conf.toObject(),
        _id: conf._id,
        type: "conference",
        name: conf.title, // Map title to name for consistency
        startDate: conf.date,
        endDate: conf.date, // Conferences are single-day
        registrationRequired: true,
        status: "published", // Assume conferences are always published
        maxParticipants: conf.capacity,
        currentParticipants: 0, // You might want to track this separately
        cost: 0 // Default cost for conferences
      }))
    ];

    // Sort combined results by date
    allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    res.status(200).json({
      success: true,
      count: allEvents.length,
      data: allEvents,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "firstName lastName email phone"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin/Events Office)
const createEvent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const event = await Event.create({
      ...req.body,
      organizer: req.user.id,
    });

    await event.populate("organizer", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin/Events Office/Organizer)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user is authorized to update this event
    if (
      event.organizer.toString() !== req.user.id &&
      !["admin", "events_office"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("organizer", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

// @desc    Update only the status of an event (e.g., publish, reject, needs_revision)
// @route   PUT /api/events/:id/status
// @access  Private (Admin/Events Office)
const updateEventStatus = async (req, res) => {
  try {
    const { status, message } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const allowedStatuses = ["pending", "published", "rejected", "cancelled", "upcoming", "needs_revision"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Only Events Office or admin can change status
    if (!["admin", "events_office"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to update event status" });
    }

    // When requesting edits, attach message into editRequests and set status to needs_revision
    if (status === "needs_revision") {
      if (!message || message.trim().length < 3) {
        return res.status(400).json({ success: false, message: "Message is required when requesting edits" });
      }

      event.editRequests.push({
        message: message.trim(),
        requestedBy: { id: req.user.id, name: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() },
        requestedAt: new Date(),
        status: "needs_revision",
      });

      event.status = "needs_revision";
      await event.save();
      await event.populate("organizer", "firstName lastName email");

      return res.status(200).json({ success: true, message: "Edit request saved", data: event });
    }

    // For other status updates we only update the status field
    event.status = status;
    await event.save();

    await event.populate("organizer", "firstName lastName email");

    res.status(200).json({ success: true, message: "Event status updated", data: event });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({ success: false, message: "Error updating event status", error: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin/Events Office/Organizer)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user is authorized to delete this event
    if (
      event.organizer.toString() !== req.user.id &&
      !["admin", "events_office"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};

// @desc    Get events by type
// @route   GET /api/events/type/:type
// @access  Public
const getEventsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const events = await Event.findByType(type).populate(
      "organizer",
      "firstName lastName email"
    );

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events by type:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching events by type",
      error: error.message,
    });
  }
};

/* --------------------------------------------------------
   EXPORTS
-------------------------------------------------------- */
module.exports = {
  getUpcomingBazaars,
  seedBazaar,
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByType,
};
