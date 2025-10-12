const Event = require("../models/Event");
const User = require("../models/User");
const Registration = require("../models/Registration");
const BoothApplication = require("../models/BoothApplication");
const { validationResult } = require("express-validator");

/* --------------------------------------------------------
   GENERAL EVENT CONTROLLERS
-------------------------------------------------------- */

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { type, status, upcoming = false } = req.query;

    // Define accepted statuses for display
    const acceptedStatuses = ["accepted", "published", "approved"];

    // Fetch regular events with accepted statuses
    let eventQuery = {};
    let boothQuery = {};

    // If status is explicitly provided, use it; otherwise use acceptedStatuses
    if (status) {
      eventQuery.status = status;
      boothQuery.status = status;
    } else {
      eventQuery.status = { $in: acceptedStatuses };
      boothQuery.status = { $in: acceptedStatuses };
    }

    // Handle upcoming filter - event is upcoming if endDate hasn't passed yet
    if (upcoming === "true") {
      const now = new Date();
      eventQuery.endDate = { $gte: now };
      boothQuery.endDate = { $gte: now };
    }

    // Handle type filter
    if (type) {
      // If specifically asking for booths, only return booths
      if (type === "booth") {
        const booths = await BoothApplication.find(boothQuery)
          .populate("vendor", "firstName lastName email")
          .sort({ startDate: 1 });
        
        return res.status(200).json({
          success: true,
          count: booths.length,
          data: booths.map(booth => transformBoothToEvent(booth))
        });
      }

      // For other types (workshop, trip, bazaar, conference), filter by type
      eventQuery.type = type;
    }

    // Fetch all event types in parallel
    const [events, booths] = await Promise.all([
      Event.find(eventQuery)
        .populate("organizer", "firstName lastName email")
        .sort({ startDate: 1 }),
      BoothApplication.find(boothQuery)
        .populate("vendor", "firstName lastName email")
        .sort({ startDate: 1 })
    ]);

    // Combine and transform the data
    const allEvents = [
      ...events.map(event => ({
        ...event.toObject(),
        name: event.title || event.name,
      })),
      ...booths.map(booth => transformBoothToEvent(booth))
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

// Helper function to transform booth to event format
const transformBoothToEvent = (booth) => {
  const boothObj = booth.toObject();
  
  // Calculate duration in weeks if durationWeeks exists
  let duration = "TBD";
  if (boothObj.durationWeeks) {
    duration = boothObj.durationWeeks === 1 
      ? "1 week" 
      : `${boothObj.durationWeeks} weeks`;
  }
  
  return {
    _id: booth._id,
    type: "booth",
    name: `Booth at ${boothObj.location || "TBD"}`,
    title: `Booth at ${boothObj.location || "TBD"}`,
    description: `Booth Size: ${boothObj.boothSize || "N/A"} | Duration: ${duration}`,
    location: boothObj.location || "TBD",
    startDate: boothObj.startDate,
    endDate: boothObj.endDate,
    status: boothObj.status || "pending",
    registrationRequired: false,
    currentParticipants: boothObj.attendees ? boothObj.attendees.length : 0,
    maxParticipants: 1,
    cost: 0,
    boothSize: boothObj.boothSize || "N/A",
    duration: duration,
    durationWeeks: boothObj.durationWeeks,
    organizer: boothObj.vendor || null,
    // Include original booth fields for reference
    vendorId: boothObj.vendor?._id || boothObj.vendor,
    attendees: boothObj.attendees || [],
    createdAt: boothObj.createdAt,
    updatedAt: boothObj.updatedAt,
  };
};

// @desc    Get single event (handles both regular events and booths)
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
    // Try to find as regular event first
    let event = await Event.findById(req.params.id).populate(
      "organizer",
      "firstName lastName email phone"
    );

    if (event) {
      return res.status(200).json({
        success: true,
        data: event,
      });
    }

    // If not found, try to find as booth
    const booth = await BoothApplication.findById(req.params.id).populate(
      "vendor",
      "firstName lastName email phone"
    );

    if (booth) {
      return res.status(200).json({
        success: true,
        data: transformBoothToEvent(booth),
      });
    }

    return res.status(404).json({
      success: false,
      message: "Event not found",
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

    const allowedStatuses = ["pending", "published", "rejected", "cancelled", "upcoming", "needs_revision", "accepted", "approved"];
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
    const acceptedStatuses = ["accepted", "published", "approved"];
    const now = new Date();

    // Handle booths
    if (type === "booth") {
      const booths = await BoothApplication.find({
        status: { $in: acceptedStatuses },
        endDate: { $gte: now }
      })
        .populate("vendor", "firstName lastName email")
        .sort({ startDate: 1 });
      
      return res.status(200).json({
        success: true,
        count: booths.length,
        data: booths.map(booth => transformBoothToEvent(booth))
      });
    }

    // Handle other event types (workshop, trip, bazaar, conference)
    const events = await Event.find({
      type,
      status: { $in: acceptedStatuses },
      endDate: { $gte: now }
    })
      .populate("organizer", "firstName lastName email")
      .sort({ startDate: 1 });

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
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getEventsByType,
};