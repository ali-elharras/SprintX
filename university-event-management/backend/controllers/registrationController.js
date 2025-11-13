const Registration = require("../models/Registration");
const Event = require("../models/Event");
const Conference = require("../models/Conference");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Public/Private (depending on authentication)
const registerForEvent = async (req, res) => {
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

    const { 
      eventId, 
      firstName, 
      lastName, 
      email, 
      universityId
    } = req.body;

    // Try to find event in Event model first
    let event = await Event.findById(eventId);
    let isConference = false;
    
    // If not found in Event model, try Conference model
    if (!event) {
      event = await Conference.findById(eventId);
      isConference = true;
    }
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // For conferences, adapt to match event structure
    let eventData = event;
    if (isConference) {
      eventData = {
        _id: event._id,
        title: event.title,
        description: event.description,
        type: "conference",
        startDate: event.date,
        endDate: event.date,
        location: event.location,
        cost: 0,
        registrationRequired: true,
        isRegistrationOpen: true,
        maxParticipants: event.capacity,
        currentParticipants: await Registration.countDocuments({
          event: eventId,
          status: { $in: ["confirmed", "pending"] }
        }),
        status: "published"
      };
    }

    // Check if event allows registration
    if (eventData.registrationRequired === false) {
      return res.status(400).json({
        success: false,
        message: "This event does not require registration",
      });
    }

    // Check if registration is still open
    if (eventData.isRegistrationOpen === false) {
      return res.status(400).json({
        success: false,
        message: "Registration is closed for this event",
      });
    }

    // Check if event has available spots
    if (eventData.currentParticipants >= eventData.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    // Check if user is already registered (excluding cancelled registrations)
    const existingRegistration = await Registration.findOne({
      event: eventId,
      status: { $ne: "cancelled" }, // Exclude cancelled registrations
      $or: [
        { email: email.toLowerCase() },
        { universityId: universityId }
      ]
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Create registration data
    const registrationData = {
      event: eventId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      universityId: universityId.trim(),
    };

    // If user is authenticated, link to user account
    if (req.user) {
      registrationData.user = req.user.id;
    }

    // Set payment information if event has cost
    if (eventData.cost > 0) {
      registrationData.paymentStatus = "pending";
      registrationData.paymentAmount = eventData.cost;
      registrationData.status = "pending"; // Keep pending until payment
    } else {
      registrationData.paymentStatus = "completed";
      registrationData.paymentMethod = "free";
      registrationData.status = "confirmed"; // Auto-confirm for free events
    }

    // Create registration
    const registration = await Registration.create(registrationData);

    // Populate the registration with appropriate data
    if (isConference) {
      // Manually attach conference data for response
      const populatedRegistration = registration.toObject();
      populatedRegistration.event = eventData;
      res.status(201).json({
        success: true,
        message: eventData.cost > 0 ? "Registration created. Please complete payment." : "Registration successful",
        data: populatedRegistration,
        requiresPayment: eventData.cost > 0,
      });
    } else {
      await registration.populate("event", "title type startDate endDate location cost maxParticipants currentParticipants");
      res.status(201).json({
        success: true,
        message: eventData.cost > 0 ? "Registration created. Please complete payment." : "Registration successful",
        data: registration,
        requiresPayment: eventData.cost > 0,
      });
    }
  } catch (error) {
    console.error("Error registering for event:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error registering for event",
      error: error.message,
    });
  }
};

// @desc    Get user's registrations
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    const { filter, search, sortBy = 'startDate', sortOrder = 'asc' } = req.query;
    
    // Build the query to find user's registrations (exclude pending/unpaid)
    let query = {
      $or: [
        { user: req.user.id },
        { email: req.user.email }
      ],
      status: { $in: ["confirmed", "attended"] }
    };

    // Find registrations
    let registrations = await Registration.find(query);

    // Populate event data from appropriate models
    const populatedRegistrations = await Promise.all(
      registrations.map(async (registration) => {
        // Try Event model first
        let event = await Event.findById(registration.event);
        
        // If not found in Event model, try Conference model
        if (!event) {
          const conference = await Conference.findById(registration.event);
          if (conference) {
            // Convert conference to event-like structure
            event = {
              _id: conference._id,
              title: conference.title,
              description: conference.description,
              type: "conference",
              startDate: conference.date,
              endDate: conference.date,
              location: conference.location,
              cost: 0,
              maxParticipants: conference.capacity,
              currentParticipants: await Registration.countDocuments({
                event: conference._id,
                status: { $in: ["confirmed", "pending"] }
              }),
              status: "published"
            };
          }
        }

        if (event) {
          const regObj = registration.toObject();
          regObj.event = event;
          return regObj;
        }
        return null;
      })
    );

  // Filter out null values (where event was not found)
  const validRegistrations = populatedRegistrations.filter(reg => reg !== null);

    // Categorize events into upcoming and past
    const now = new Date();
    const upcomingEvents = [];
    const pastEvents = [];

    validRegistrations.forEach(registration => {
      const eventStartDate = new Date(registration.event.startDate);
      if (eventStartDate >= now) {
        upcomingEvents.push(registration);
      } else {
        pastEvents.push(registration);
      }
    });

    // Apply search filter if provided
    const applySearch = (events, searchTerm) => {
      if (!searchTerm) return events;
      const term = searchTerm.toLowerCase();
      return events.filter(reg => 
        reg.event.title.toLowerCase().includes(term) ||
        (reg.event.type && reg.event.type.toLowerCase().includes(term)) ||
        reg.event.location.toLowerCase().includes(term)
      );
    };

    // Apply event type filter if provided
    const applyFilter = (events, filterType) => {
      if (!filterType || filterType === 'all') return events;
      return events.filter(reg => reg.event.type === filterType);
    };

    // Sort events
    const sortEvents = (events, sortBy, sortOrder) => {
      return events.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'startDate':
            aValue = new Date(a.event.startDate);
            bValue = new Date(b.event.startDate);
            break;
          case 'title':
            aValue = a.event.title.toLowerCase();
            bValue = b.event.title.toLowerCase();
            break;
          case 'type':
            aValue = a.event.type.toLowerCase();
            bValue = b.event.type.toLowerCase();
            break;
          case 'registrationDate':
            aValue = new Date(a.registrationDate);
            bValue = new Date(b.registrationDate);
            break;
          default:
            aValue = new Date(a.event.startDate);
            bValue = new Date(b.event.startDate);
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    };

    // Apply filters and search
    let filteredUpcoming = applyFilter(upcomingEvents, filter);
    let filteredPast = applyFilter(pastEvents, filter);
    
    filteredUpcoming = applySearch(filteredUpcoming, search);
    filteredPast = applySearch(filteredPast, search);

    // Sort events
    filteredUpcoming = sortEvents(filteredUpcoming, sortBy, sortOrder);
    filteredPast = sortEvents(filteredPast, sortBy, sortOrder === 'asc' ? 'desc' : 'asc'); // Reverse sort for past events

    // Prepare response data
    const responseData = {
      upcoming: filteredUpcoming,
      past: filteredPast,
      summary: {
        totalRegistrations: validRegistrations.length,
        upcomingCount: filteredUpcoming.length,
        pastCount: filteredPast.length,
        allUpcomingCount: upcomingEvents.length,
        allPastCount: pastEvents.length
      }
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching registrations",
      error: error.message,
    });
  }
};

// @desc    Get registrations for an event
// @route   GET /api/registrations/event/:eventId
// @access  Private (Admin/Events Office/Organizer)
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Try to find the event in Event model first
    let event = await Event.findById(eventId);
    let isConference = false;
    
    // If not found in Event model, try Conference model
    if (!event) {
      event = await Conference.findById(eventId);
      isConference = true;
    }
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is authorized to view registrations
    // For conferences, allow events_office and admin
    if (isConference) {
      if (!["admin", "events_office"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view event registrations",
        });
      }
    } else {
      // For regular events, check organizer and roles
      if (
        event.organizer.toString() !== req.user.id &&
        !["admin", "events_office"].includes(req.user.role)
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view event registrations",
        });
      }
    }
    
    const registrations = await Registration.find({ event: eventId })
      .populate('user', 'firstName lastName email universityId role')
      .sort({ registrationDate: -1 });
    
    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching event registrations",
      error: error.message,
    });
  }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private
const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    
    // Check if user is authorized to cancel this registration
    if (
      registration.user?.toString() !== req.user.id &&
      registration.email !== req.user.email &&
      !["admin", "events_office"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this registration",
      });
    }
    
    // Check if registration can be cancelled
    let event;
    const eventFromEvent = await Event.findById(registration.event);
    if (eventFromEvent) {
      event = eventFromEvent;
    } else {
      const eventFromConference = await Conference.findById(registration.event);
      if (eventFromConference) {
        event = {
          startDate: eventFromConference.date
        };
      }
    }
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    const now = new Date();
    const eventStart = new Date(event.startDate);
    
    // Allow cancellation up to 24 hours before the event
    const cancellationDeadline = new Date(eventStart.getTime() - 24 * 60 * 60 * 1000);
    
    if (now > cancellationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel registration within 24 hours of the event",
      });
    }
    
    await registration.cancelRegistration();
    
    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling registration",
      error: error.message,
    });
  }
};

// @desc    Update registration status
// @route   PUT /api/registrations/:id/status
// @access  Private (Admin/Events Office/Organizer)
const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    
    // Find the event to check authorization
    let event = await Event.findById(registration.event);
    let isConference = false;
    
    if (!event) {
      event = await Conference.findById(registration.event);
      isConference = true;
    }
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is authorized to update registration status
    if (isConference) {
      // For conferences, allow events_office and admin
      if (!["admin", "events_office"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update registration status",
        });
      }
    } else {
      // For regular events, check organizer and roles
      if (
        event.organizer.toString() !== req.user.id &&
        !["admin", "events_office"].includes(req.user.role)
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update registration status",
        });
      }
    }
    
    registration.status = status;
    await registration.save();
    
    res.status(200).json({
      success: true,
      message: "Registration status updated successfully",
      data: registration,
    });
  } catch (error) {
    console.error("Error updating registration status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating registration status",
      error: error.message,
    });
  }
};

// @desc    Check-in participant
// @route   POST /api/registrations/:id/checkin
// @access  Private (Admin/Events Office/Organizer)
const checkInParticipant = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    
    // Find the event to check authorization
    let event = await Event.findById(registration.event);
    let isConference = false;
    
    if (!event) {
      event = await Conference.findById(registration.event);
      isConference = true;
    }
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is authorized to check in participants
    if (isConference) {
      // For conferences, allow events_office and admin
      if (!["admin", "events_office"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to check in participants",
        });
      }
    } else {
      // For regular events, check organizer and roles
      if (
        event.organizer.toString() !== req.user.id &&
        !["admin", "events_office"].includes(req.user.role)
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to check in participants",
        });
      }
    }
    
    registration.checkedIn = true;
    registration.checkInTime = new Date();
    registration.status = "attended";
    await registration.save();
    
    res.status(200).json({
      success: true,
      message: "Participant checked in successfully",
      data: registration,
    });
  } catch (error) {
    console.error("Error checking in participant:", error);
    res.status(500).json({
      success: false,
      message: "Error checking in participant",
      error: error.message,
    });
  }
};

// @desc    Register for a paid event (requires payment before confirmation)
// @route   POST /api/registrations/paid-event
// @access  Private
const registerForPaidEvent = async (req, res) => {
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

    const { 
      eventId, 
      firstName, 
      lastName, 
      email, 
      universityId
    } = req.body;

    // Try to find event in Event model first
    let event = await Event.findById(eventId);
    let isConference = false;
    
    // If not found in Event model, try Conference model
    if (!event) {
      event = await Conference.findById(eventId);
      isConference = true;
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event has cost (this function is only for paid events)
    if (!event.cost || event.cost <= 0) {
      return res.status(400).json({
        success: false,
        message: "This event is free. Use regular registration instead.",
      });
    }

    // Check if event is still accepting registrations
    if (event.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This event has been cancelled",
      });
    }

    // Check if registration deadline has passed
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline has passed",
      });
    }

    // Check if event is full
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    // Check for existing registration
    const existingRegistration = await Registration.findOne({
      event: eventId,
      $or: [
        { email: email.toLowerCase().trim() },
        { universityId: universityId }
      ]
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Create registration data with pending payment status
    const registrationData = {
      event: eventId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      universityId: universityId.trim(),
      paymentStatus: "pending",
      paymentAmount: event.cost,
      status: "pending", // Registration is pending until payment
    };

    // If user is authenticated, link to user account
    if (req.user) {
      registrationData.user = req.user.id;
    }

    // Create registration
    const registration = await Registration.create(registrationData);

    // Populate the registration with event data
    await registration.populate("event", "title type startDate endDate location cost maxParticipants currentParticipants");

    res.status(201).json({
      success: true,
      message: "Registration created. Payment required to confirm your spot.",
      data: registration,
      requiresPayment: true,
      paymentAmount: event.cost,
    });
  } catch (error) {
    console.error("Error in paid event registration:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

module.exports = {
  registerForEvent,
  registerForPaidEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  updateRegistrationStatus,
  checkInParticipant,
};