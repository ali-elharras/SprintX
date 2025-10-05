const Registration = require("../models/Registration");
const Event = require("../models/Event");
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

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event allows registration
    if (!event.registrationRequired) {
      return res.status(400).json({
        success: false,
        message: "This event does not require registration",
      });
    }

    // Check if registration is still open
    if (!event.isRegistrationOpen) {
      return res.status(400).json({
        success: false,
        message: "Registration is closed for this event",
      });
    }

    // Check if event has available spots
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      event: eventId,
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
    if (event.cost > 0) {
      registrationData.paymentStatus = "pending";
      registrationData.paymentAmount = event.cost;
    }

    // Create registration
    const registration = await Registration.create(registrationData);

    // Populate the registration with event details
    await registration.populate("event", "title type startDate location cost");

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: registration,
    });
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
    
    // Build the query to find user's registrations
    let query = {
      $or: [
        { user: req.user.id },
        { email: req.user.email }
      ]
    };

    // Find registrations and populate event details
    let registrationsQuery = Registration.find(query)
      .populate({
        path: "event",
        select: "title type startDate endDate location cost status description maxParticipants currentParticipants",
        match: { status: { $ne: "cancelled" } } // Only include active events
      });

    const registrations = await registrationsQuery.exec();

    // Filter out registrations where event was deleted or cancelled
    const validRegistrations = registrations.filter(reg => reg.event);

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
        reg.event.type.toLowerCase().includes(term) ||
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
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    // Check if user is authorized to view registrations
    if (
      event.organizer.toString() !== req.user.id &&
      !["admin", "events_office"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view event registrations",
      });
    }
    
    const registrations = await Registration.findByEvent(eventId)
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
    const event = await Event.findById(registration.event);
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
    const event = await Event.findById(registration.event);
    
    // Check if user is authorized to update registration status
    if (
      event.organizer.toString() !== req.user.id &&
      !["admin", "events_office"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update registration status",
      });
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
    const event = await Event.findById(registration.event);
    
    // Check if user is authorized to check in participants
    if (
      event.organizer.toString() !== req.user.id &&
      !["admin", "events_office"].includes(req.user.role)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to check in participants",
      });
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

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  updateRegistrationStatus,
  checkInParticipant,
};