const Event = require("../models/Event");
const User = require("../models/User");
const Registration = require("../models/Registration");
const BoothApplication = require("../models/BoothApplication");
const Conference = require("../models/Conference");
const Workshop = require("../models/Workshop");
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

    // BROADEN STATUS FILTER - include all active statuses
    const acceptedStatuses = ["accepted", "published", "approved", "upcoming", "active", "completed"];
    
    // If specific status is requested, use it; otherwise use broader acceptedStatuses
    let eventQuery = {};
    let boothQuery = {};
    let conferenceQuery = {};
    let workshopQuery = {};

    if (status) {
      eventQuery.status = status;
      boothQuery.status = status;
      conferenceQuery = {};
      workshopQuery.status = status;
    } else {
      // Use broader status filter for events and booths
      eventQuery.status = { $in: acceptedStatuses };
      boothQuery.status = { $in: acceptedStatuses };
      workshopQuery.status = { $in: [...acceptedStatuses, "pending", "needs_revision"] };
    }

    // Handle upcoming filter
    if (upcoming === "true") {
      const now = new Date();
      eventQuery.startDate = { $gte: now };
      boothQuery.startDate = { $gte: now };
      conferenceQuery.startDate = { $gte: now };
      workshopQuery.startDate = { $gte: now };
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

      // For other types, filter by type
      eventQuery.type = type;
      workshopQuery = { ...workshopQuery, ...(type === 'workshop' ? {} : { _id: null }) };
    }

    // Fetch all event types in parallel
    const [events, booths, conferences, workshops] = await Promise.all([
      Event.find(eventQuery)
        .populate("organizer", "firstName lastName email")
        .sort({ startDate: 1 }),
      BoothApplication.find(boothQuery)
        .populate("vendor", "firstName lastName email")
        .sort({ startDate: 1 }),
      Conference.find(conferenceQuery).sort({ startDate: 1 }),
      Workshop.find(workshopQuery)
        .populate("createdBy", "firstName lastName email")
        .sort({ startDate: 1 })
    ]);

    // Combine and transform the data
    const allEvents = [
      ...events.map(event => ({
        ...event.toObject(),
        name: event.title || event.name,
        _id: event._id,
        type: event.type,
      })),
      ...booths.map(booth => transformBoothToEvent(booth)),
      ...conferences.map(conference => transformConferenceToEvent(conference)),
      ...workshops.map(workshop => transformWorkshopToEvent(workshop))
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
    vendorId: boothObj.vendor?._id || boothObj.vendor,
    attendees: boothObj.attendees || [],
    createdAt: boothObj.createdAt,
    updatedAt: boothObj.updatedAt,
  };
};

// Helper function to transform conference to event format
const transformConferenceToEvent = (conference) => {
  const conferenceObj = conference.toObject();
  
  return {
    _id: conference._id,
    type: "conference",
    name: conferenceObj.name,
    title: conferenceObj.name,
    description: conferenceObj.shortDescription || "Conference event",
    shortDescription: conferenceObj.shortDescription,
    fullAgenda: conferenceObj.fullAgenda,
    location: conferenceObj.location,
    startDate: conferenceObj.startDate,
    endDate: conferenceObj.endDate,
    status: "published",
    registrationRequired: true,
    currentParticipants: 0,
    maxParticipants: conferenceObj.maxParticipants,
    cost: 0,
    websiteLink: conferenceObj.websiteLink,
    requiredBudget: conferenceObj.requiredBudget,
    sourceOfFunding: conferenceObj.sourceOfFunding,
    extraRequiredResources: conferenceObj.extraRequiredResources,
    createdAt: conferenceObj.createdAt,
    updatedAt: conferenceObj.updatedAt,
  };
};

// Helper function to transform workshop to event format
const transformWorkshopToEvent = (workshop) => {
  const workshopObj = workshop.toObject();
  
  return {
    _id: workshop._id,
    type: "workshop",
    name: workshopObj.workshopName,
    title: workshopObj.workshopName,
    description: workshopObj.shortDescription,
    shortDescription: workshopObj.shortDescription,
    location: workshopObj.location,
    startDate: workshopObj.startDate,
    endDate: workshopObj.endDate,
    status: workshopObj.status || "pending",
    registrationRequired: true,
    currentParticipants: 0,
    maxParticipants: workshopObj.capacity,
    cost: 0,
    instructor: workshopObj.facultyResponsible,
    professorName: workshopObj.facultyResponsible,
    fullAgenda: workshopObj.fullAgenda,
    registrationDeadline: workshopObj.registrationDeadline,
    duration: Math.round((new Date(workshopObj.endDate) - new Date(workshopObj.startDate)) / (1000 * 60 * 60)),
    facultyResponsible: workshopObj.facultyResponsible,
    requiredBudget: workshopObj.requiredBudget,
    fundingSource: workshopObj.fundingSource,
    extraRequiredResources: workshopObj.extraRequiredResources,
    createdAt: workshopObj.createdAt,
    updatedAt: workshopObj.updatedAt,
  };
};

// @desc    Get single event (handles all event types)
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res) => {
  try {
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

    const conference = await Conference.findById(req.params.id);
    if (conference) {
      return res.status(200).json({
        success: true,
        data: transformConferenceToEvent(conference),
      });
    }

    const workshop = await Workshop.findById(req.params.id).populate(
      "createdBy",
      "firstName lastName email phone"
    );
    if (workshop) {
      return res.status(200).json({
        success: true,
        data: transformWorkshopToEvent(workshop),
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

// @desc    Update only the status of an event
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

    if (!["admin", "events_office"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to update event status" });
    }

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
    const acceptedStatuses = ["accepted", "published", "approved", "upcoming", "active", "completed"];
    const now = new Date();

    if (type === "booth") {
      const booths = await BoothApplication.find({
        status: { $in: acceptedStatuses },
        startDate: { $gte: now }
      })
        .populate("vendor", "firstName lastName email")
        .sort({ startDate: 1 });
      
      return res.status(200).json({
        success: true,
        count: booths.length,
        data: booths.map(booth => transformBoothToEvent(booth))
      });
    }

    if (type === "conference") {
      const conferences = await Conference.find({
        startDate: { $gte: now }
      }).sort({ startDate: 1 });
      
      return res.status(200).json({
        success: true,
        count: conferences.length,
        data: conferences.map(conference => transformConferenceToEvent(conference))
      });
    }

    if (type === "workshop") {
      const workshops = await Workshop.find({
        status: { $in: [...acceptedStatuses, "pending", "needs_revision"] },
        startDate: { $gte: now }
      })
        .populate("createdBy", "firstName lastName email")
        .sort({ startDate: 1 });
      
      return res.status(200).json({
        success: true,
        count: workshops.length,
        data: workshops.map(workshop => transformWorkshopToEvent(workshop))
      });
    }

    const events = await Event.find({
      type,
      status: { $in: acceptedStatuses },
      startDate: { $gte: now }
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
      status: { $in: ["published", "accepted", "approved", "upcoming", "active"] }
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

    const today = new Date();
    const futureDate = new Date(today.setDate(today.getDate() + 30));

    const bazaar = await Event.create({
      name: "Annual Spring Bazaar",
      description: "A wonderful bazaar with lots of vendors and activities.",
      eventType: "bazaar",
      startDate: futureDate,
      endDate: new Date(futureDate.getTime() + 86400000),
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
  getUpcomingBazaars,
  seedBazaar
};