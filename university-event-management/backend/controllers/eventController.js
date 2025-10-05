const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { validationResult } = require("express-validator");

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { type, status = "published", upcoming = false } = req.query;
    
    let query = { status };
    
    if (type) {
      query.type = type;
    }
    
    if (upcoming === "true") {
      query.startDate = { $gte: new Date() };
    }
    
    const events = await Event.find(query)
      .populate("organizer", "firstName lastName email")
      .sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
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
    const event = await Event.findById(req.params.id)
      .populate("organizer", "firstName lastName email phone");
    
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
    const events = await Event.findByType(type)
      .populate("organizer", "firstName lastName email");
    
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

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByType,
};