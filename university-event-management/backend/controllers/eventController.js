const Event = require("../models/Event");
const User = require("../models/User");
const Registration = require("../models/Registration");
const BoothApplication = require("../models/BoothApplication");
const Conference = require("../models/Conference");
const Workshop = require("../models/Workshop");
const { validationResult } = require("express-validator");
const { notifyAllUsersAboutNewEvent } = require("./notificationController");

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
    const { type, status = ["approved", "accepted", "published"], upcoming = false, includeArchived = false } = req.query;

    let eventQuery = { status };
    let boothQuery = { status };
    let conferenceQuery = {};
    let workshopQuery = {};

    if (includeArchived !== 'true') {
        eventQuery.isArchived = { $ne: true };
        boothQuery.isArchived = { $ne: true };
        conferenceQuery.isArchived = { $ne: true };
        workshopQuery.isArchived = { $ne: true };
    }

    if (type) {
      eventQuery.type = type;
    }

    if (upcoming === "true") {
      const now = new Date();
      eventQuery.startDate = { $gte: now };
      boothQuery.startDate = { $gte: now };
      conferenceQuery.startDate = { $gte: now };
      workshopQuery.startDate = { $gte: now };
    }

    // Role-based filtering
    if (req.user) {
      if (!["admin", "events_office"].includes(req.user.role)) {
        eventQuery.eligibleRoles = req.user.role;
      }
    } else {
      // For guests, only show events that are not restricted
      eventQuery.eligibleRoles = { $all: ["student", "ta", "professor", "staff"] };
    }

    // Handle type filter
    if (type) {
      // If specifically asking for booths, only return booths
      if (type === "booth") {
        const booths = await BoothApplication.find(boothQuery)
          .populate("vendor", "companyName firstName lastName email")
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

    // Exclude published workshops from Workshop collection since they appear as Event documents
    // Published workshops should only be returned from the Event collection, not Workshop collection
    workshopQuery.publishedEventId = { $exists: false };

    // Fetch all event types in parallel
    const [events, booths, conferences, workshops] = await Promise.all([
      Event.find(eventQuery)
        .populate("organizer", "firstName lastName email")
        .sort({ startDate: 1 }),
      BoothApplication.find(boothQuery)
        .populate("vendor", "companyName firstName lastName email")
        .sort({ startDate: 1 }),
      Conference.find(conferenceQuery).sort({ startDate: 1 }),
      Workshop.find(workshopQuery)
        .populate("createdBy", "firstName lastName email")
        .sort({ startDate: 1 })
    ]);

    // Calculate current participants for bazaars
    const BazaarApplication = require("../models/BazaarApplication");
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const eventObj = event.toObject();
        
        // If it's a bazaar, calculate approved vendors count
        if (eventObj.type === 'bazaar') {
          const approvedVendorsCount = await BazaarApplication.countDocuments({
            bazaar: eventObj._id,
            status: "approved"
          });
          eventObj.currentParticipants = approvedVendorsCount;
        }
        
        return {
          ...eventObj,
          name: eventObj.title || eventObj.name,
          _id: eventObj._id,
          type: eventObj.type,
        };
      })
    );

    // Combine and transform the data
    // For workshops, compute currentParticipants by counting registrations for the published Event (if available)
    const Registration = require('../models/Registration');

    const workshopEvents = await Promise.all(
      workshops.map(async (workshop) => {
        const workshopObj = workshop.toObject();
        let currentParticipants = 0;

        try {
          if (workshopObj.publishedEventId) {
            currentParticipants = await Registration.countDocuments({
              event: workshopObj.publishedEventId,
              status: { $in: ['confirmed', 'attended'] },
            });
          }
        } catch (err) {
          console.error('Error counting workshop registrations for workshop', workshopObj._id, err);
          currentParticipants = 0;
        }

        return {
          _id: workshopObj._id,
          type: 'workshop',
          name: workshopObj.workshopName,
          title: workshopObj.workshopName,
          description: workshopObj.shortDescription,
          shortDescription: workshopObj.shortDescription,
          location: workshopObj.location,
          startDate: workshopObj.startDate,
          endDate: workshopObj.endDate,
          status: workshopObj.status || 'pending',
          registrationRequired: true,
          currentParticipants: currentParticipants,
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
          isArchived: workshopObj.isArchived,
          publishedEventId: workshopObj.publishedEventId,
        };
      })
    );

    const allEvents = [
      ...eventsWithCounts,
      ...booths.map(booth => transformBoothToEvent(booth)),
      ...conferences.map(conference => transformConferenceToEvent(conference)),
      ...workshopEvents
    ];

    // Sort combined results by date
    allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    return res.status(200).json({
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
  
  // Map booth status to event status - 'approved' booths should show as 'published'
  const eventStatus = boothObj.status === 'approved' ? 'published' : boothObj.status || 'pending';
  
  // Get vendor/company name
  const vendorName = boothObj.vendor?.companyName || 
                     (boothObj.vendor?.firstName && boothObj.vendor?.lastName 
                       ? `${boothObj.vendor.firstName} ${boothObj.vendor.lastName}` 
                       : null);
  
  return {
    _id: booth._id,
    type: "booth",
    name: vendorName ? `${vendorName} - Booth at ${boothObj.location || "TBD"}` : `Booth at ${boothObj.location || "TBD"}`,
    title: vendorName ? `${vendorName} - Booth at ${boothObj.location || "TBD"}` : `Booth at ${boothObj.location || "TBD"}`,
    description: `Vendor: ${vendorName || "TBD"} | Booth Size: ${boothObj.boothSize || "N/A"} | Duration: ${duration}`,
    location: boothObj.location || "TBD",
    startDate: boothObj.startDate,
    endDate: boothObj.endDate,
    status: eventStatus,
    registrationRequired: false,
    currentParticipants: boothObj.attendees ? boothObj.attendees.length : 0,
    maxParticipants: 1,
    cost: 0,
    boothSize: boothObj.boothSize || "N/A",
    duration: duration,
    durationWeeks: boothObj.durationWeeks,
    organizer: boothObj.vendor || null,
    vendorId: boothObj.vendor?._id || boothObj.vendor,
    companyName: vendorName,
    attendees: boothObj.attendees || [],
    createdAt: boothObj.createdAt,
    updatedAt: boothObj.updatedAt,
    isArchived: booth.isArchived,
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
    isArchived: conference.isArchived,
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
    isArchived: workshop.isArchived,
  };
};

// @desc    Get single event (handles all event types)
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

    const booth = await BoothApplication.findById(req.params.id).populate(
      "vendor",
      "companyName firstName lastName email phone"
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

    return res.status(200).json({
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
    // Manual validation similar to createBazaar: require core fields
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      location,
      registrationDeadline,
      maxParticipants,
      cost,
    } = req.body;

    // Basic required fields for a generic event
    if (!title || !description || !startDate || !endDate || !location || !registrationDeadline || !maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Build event payload
    const eventPayload = {
      title,
      name: title,
      description,
      type: type || 'workshop',
      startDate,
      endDate,
      location,
      registrationRequired: true,
      registrationDeadline,
      maxParticipants,
      cost: typeof cost !== 'undefined' ? cost : 0,
      organizer: req.user.id,
      status : "published"
    };

    // If workshop, copy over workshop-specific fields if provided
    if (String(eventPayload.type) === 'workshop') {
      if (req.body.instructor) eventPayload.instructor = req.body.instructor;
      if (req.body.duration) eventPayload.duration = req.body.duration;
    }

    const newEvent = await Event.create(eventPayload);
    await newEvent.populate('organizer', 'firstName lastName email');

    // Notify all users about the new event
    try {
        await notifyAllUsersAboutNewEvent(newEvent.title || newEvent.name, newEvent._id);
    } catch (notifError) {
        console.error('Error notifying users about new event:', notifError);
    }

    res.status(201).json({ success: true, message: 'Event created successfully', data: newEvent });
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

    // Check if there are any registrations for this event
    const Registration = require("../models/Registration");
    const registrationCount = await Registration.countDocuments({
      event: req.params.id,
      status: { $in: ["confirmed", "attended"] }, // Exclude pending/unpaid registrations
    });

    if (registrationCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete event. There are ${registrationCount} active registration(s). Please cancel all registrations before deleting the event.`,
        registrationCount,
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
        .populate("vendor", "companyName firstName lastName email")
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
        startDate: { $gte: now },
        publishedEventId: { $exists: false } // Exclude published workshops - they appear as Event documents
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
   EXPORTS
-------------------------------------------------------- */

// @desc    Archive or unarchive an event
// @route   PATCH /api/events/:id/archive
// @access  Private (Admin/Events Office)
const toggleArchiveStatus = async (req, res) => {
  try {
    const { isArchived } = req.body;

    if (typeof isArchived !== 'boolean') {
      return res.status(400).json({ success: false, message: "isArchived is required and must be a boolean." });
    }

    let doc = await Event.findById(req.params.id) || 
              await BoothApplication.findById(req.params.id) ||
              await Conference.findById(req.params.id) ||
              await Workshop.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Only Events Office or admin can archive
    if (!["admin", "events_office"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Not authorized to archive this event" });
    }

    // An event must have ended to be archived
    if (isArchived && doc.endDate > new Date()) {
        return res.status(400).json({ success: false, message: "Cannot archive an event that has not ended yet." });
    }

    doc.isArchived = isArchived;
    await doc.save();

    res.status(200).json({ success: true, message: `Event ${isArchived ? 'archived' : 'unarchived'} successfully.`, data: doc });

  } catch (error) {
    console.error("Error updating event archive status:", error);
    res.status(500).json({ success: false, message: "Error updating event archive status", error: error.message });
  }
};

module.exports = {
  getUpcomingBazaars,
  seedBazaar,
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByType,
  toggleArchiveStatus,
};
