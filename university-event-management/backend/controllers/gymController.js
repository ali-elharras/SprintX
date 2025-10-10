const GymSession = require("../models/GymSession");
const GymRegistration = require("../models/GymRegistration");
const { validationResult } = require("express-validator");

// @desc    Get all gym sessions
// @route   GET /api/gym/sessions
// @access  Public
const getGymSessions = async (req, res) => {
  try {
    const { 
      type, 
      month, 
      year, 
      dayOfWeek,
      status = "active",
      instructor,
      location,
      skillLevel,
      available = false
    } = req.query;
    
    let query = { status };
    
    // Filter by session type
    if (type) {
      query.type = type;
    }
    
    // Filter by instructor
    if (instructor) {
      query["instructor.name"] = new RegExp(instructor, "i");
    }
    
    // Filter by location
    if (location) {
      query.location = new RegExp(location, "i");
    }
    
    // Filter by skill level
    if (skillLevel) {
      query.skillLevel = skillLevel;
    }
    
    // Filter by day of week
    if (dayOfWeek) {
      query.dayOfWeek = parseInt(dayOfWeek);
    }
    
    // Filter by month and year
    if (month && year) {
      const sessions = await GymSession.findByMonth(parseInt(year), parseInt(month));
      return res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions,
      });
    }
    
    let sessions = await GymSession.find(query)
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    // Filter by availability if requested
    if (available === "true") {
      sessions = sessions.filter(session => !session.isFull);
    }
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error("Error fetching gym sessions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gym sessions",
      error: error.message,
    });
  }
};

// @desc    Get gym sessions by month
// @route   GET /api/gym/sessions/month/:year/:month
// @access  Public
const getGymSessionsByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const { type, available, skillLevel } = req.query;
    
    let sessions = await GymSession.findByMonth(parseInt(year), parseInt(month));
    
    // Additional filtering
    if (type) {
      sessions = sessions.filter(session => session.type === type);
    }
    
    if (skillLevel) {
      sessions = sessions.filter(session => session.skillLevel === skillLevel);
    }
    
    if (available === "true") {
      sessions = sessions.filter(session => !session.isFull);
    }
    
    // Group sessions by day of week for easier frontend consumption
    const sessionsByDay = sessions.reduce((acc, session) => {
      const day = session.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(session);
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: {
        sessions,
        sessionsByDay,
        year: parseInt(year),
        month: parseInt(month),
      },
    });
  } catch (error) {
    console.error("Error fetching gym sessions by month:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gym sessions by month",
      error: error.message,
    });
  }
};

// @desc    Get gym sessions by date
// @route   GET /api/gym/sessions/date/:date
// @access  Public
const getGymSessionsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }
    
    const sessions = await GymSession.findByDate(targetDate);
    
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
      date: targetDate,
    });
  } catch (error) {
    console.error("Error fetching gym sessions by date:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gym sessions by date",
      error: error.message,
    });
  }
};

// @desc    Get single gym session
// @route   GET /api/gym/sessions/:id
// @access  Public
const getGymSession = async (req, res) => {
  try {
    const session = await GymSession.findById(req.params.id)
      .populate("createdBy", "firstName lastName email");
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Gym session not found",
      });
    }
    
    // Get current registrations count
    const activeRegistrations = await GymRegistration.countDocuments({
      gymSession: req.params.id,
      status: "active",
    });
    
    // Get waitlist count
    const waitlistCount = await GymRegistration.countDocuments({
      gymSession: req.params.id,
      status: "waitlisted",
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...session.toObject(),
        currentParticipants: activeRegistrations,
        waitlistCount,
      },
    });
  } catch (error) {
    console.error("Error fetching gym session:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gym session",
      error: error.message,
    });
  }
};

// @desc    Get gym session types
// @route   GET /api/gym/types
// @access  Public
const getGymSessionTypes = async (req, res) => {
  try {
    const types = [
      { value: "yoga", label: "Yoga", description: "Mind-body practice combining physical postures, breathing, and meditation" },
      { value: "pilates", label: "Pilates", description: "Low-impact exercise focusing on strength, flexibility, and posture" },
      { value: "aerobics", label: "Aerobics", description: "Cardiovascular exercise set to music" },
      { value: "zumba", label: "Zumba", description: "Dance fitness program combining Latin rhythms with aerobic movements" },
      { value: "cross_circuit", label: "Cross Circuit", description: "High-intensity functional fitness combining various exercises" },
      { value: "kickboxing", label: "Kickboxing", description: "Martial arts-inspired cardio workout" },
      { value: "cardio", label: "Cardio", description: "Heart-pumping exercises to improve cardiovascular health" },
      { value: "strength_training", label: "Strength Training", description: "Resistance exercises to build muscle and bone strength" },
      { value: "dance", label: "Dance", description: "Rhythmic movement classes in various styles" },
      { value: "martial_arts", label: "Martial Arts", description: "Traditional and modern combat techniques" },
      { value: "swimming", label: "Swimming", description: "Aquatic fitness and technique sessions" },
      { value: "spinning", label: "Spinning", description: "Indoor cycling classes with music and instruction" },
    ];
    
    res.status(200).json({
      success: true,
      count: types.length,
      data: types,
    });
  } catch (error) {
    console.error("Error fetching gym session types:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gym session types",
      error: error.message,
    });
  }
};

// @desc    Register for gym session
// @route   POST /api/gym/sessions/:id/register
// @access  Private
const registerForGymSession = async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const userId = req.user.id;
    const { 
      startDate, 
      endDate, 
      registrationType = "regular",
      medicalConditions,
      emergencyContact,
      notifications 
    } = req.body;

    // Check if session exists
    const session = await GymSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Gym session not found",
      });
    }

    // Check if user can register
    if (!session.canUserRegister(req.user)) {
      return res.status(400).json({
        success: false,
        message: "You are not eligible to register for this session",
      });
    }

    // Check if user is already registered
    const existingRegistration = await GymRegistration.findOne({
      user: userId,
      gymSession: sessionId,
      status: { $in: ["active", "waitlisted"] },
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this session",
      });
    }

    // Determine registration status
    let registrationStatus = "active";
    let waitlistPosition = null;

    if (session.isFull) {
      if (session.waitlistEnabled) {
        registrationStatus = "waitlisted";
        const lastWaitlistPosition = await GymRegistration.findOne({
          gymSession: sessionId,
          status: "waitlisted",
        }).sort({ waitlistPosition: -1 });
        
        waitlistPosition = lastWaitlistPosition ? lastWaitlistPosition.waitlistPosition + 1 : 1;
      } else {
        return res.status(400).json({
          success: false,
          message: "Session is full and waitlist is not available",
        });
      }
    }

    // Create registration
    const registration = new GymRegistration({
      user: userId,
      gymSession: sessionId,
      registrationType,
      startDate: startDate || session.startDate,
      endDate: endDate || session.endDate,
      status: registrationStatus,
      waitlistPosition,
      medicalConditions,
      emergencyContact,
      notifications,
    });

    await registration.save();

    // Update session participant count if not waitlisted
    if (registrationStatus === "active") {
      await GymSession.findByIdAndUpdate(sessionId, {
        $inc: { currentParticipants: 1 },
      });
    }

    await registration.populate("gymSession");
    await registration.populate("user", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: registrationStatus === "active" 
        ? "Successfully registered for gym session" 
        : `Added to waitlist at position ${waitlistPosition}`,
      data: registration,
    });
  } catch (error) {
    console.error("Error registering for gym session:", error);
    res.status(500).json({
      success: false,
      message: "Error registering for gym session",
      error: error.message,
    });
  }
};

// @desc    Get user's gym registrations
// @route   GET /api/gym/registrations
// @access  Private
const getUserGymRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, upcoming = false } = req.query;
    
    let query = { user: userId };
    
    if (status) {
      query.status = status;
    }
    
    let registrations = await GymRegistration.find(query)
      .populate("gymSession")
      .sort({ registrationDate: -1 });
    
    // Filter for upcoming sessions if requested
    if (upcoming === "true") {
      const now = new Date();
      registrations = registrations.filter(registration => {
        return registration.gymSession && registration.gymSession.endDate >= now;
      });
    }
    
    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    console.error("Error fetching gym registrations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gym registrations",
      error: error.message,
    });
  }
};

// @desc    Cancel gym registration
// @route   DELETE /api/gym/registrations/:id
// @access  Private
const cancelGymRegistration = async (req, res) => {
  try {
    const registrationId = req.params.id;
    const userId = req.user.id;
    const { reason } = req.body;

    const registration = await GymRegistration.findOne({
      _id: registrationId,
      user: userId,
    }).populate("gymSession");

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (registration.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Registration is already cancelled",
      });
    }

    // Cancel the registration
    await registration.cancelRegistration(reason);

    // Update session participant count if it was active
    if (registration.status === "active") {
      await GymSession.findByIdAndUpdate(registration.gymSession._id, {
        $inc: { currentParticipants: -1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
      data: registration,
    });
  } catch (error) {
    console.error("Error cancelling gym registration:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling gym registration",
      error: error.message,
    });
  }
};

// @desc    Get gym schedule overview
// @route   GET /api/gym/schedule/overview
// @access  Public
const getGymScheduleOverview = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    
    // Get all sessions for the month
    const sessions = await GymSession.findByMonth(targetYear, targetMonth);
    
    // Group by session type
    const sessionsByType = sessions.reduce((acc, session) => {
      if (!acc[session.type]) {
        acc[session.type] = [];
      }
      acc[session.type].push(session);
      return acc;
    }, {});
    
    // Get statistics
    const stats = {
      totalSessions: sessions.length,
      totalTypes: Object.keys(sessionsByType).length,
      averageCapacity: sessions.length > 0 
        ? Math.round(sessions.reduce((sum, s) => sum + s.maxParticipants, 0) / sessions.length)
        : 0,
      popularTypes: Object.entries(sessionsByType)
        .map(([type, typeSessions]) => ({
          type,
          count: typeSessions.length,
          totalCapacity: typeSessions.reduce((sum, s) => sum + s.maxParticipants, 0),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
    
    res.status(200).json({
      success: true,
      data: {
        sessions,
        sessionsByType,
        stats,
        month: targetMonth,
        year: targetYear,
      },
    });
  } catch (error) {
    console.error("Error fetching gym schedule overview:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gym schedule overview",
      error: error.message,
    });
  }
};
// @desc    Create a new gym session
// @route   POST /api/gym/sessions
// @access  Private (admin or events_office)
const createGymSession = async (req, res) => {
  try {
    // Basic validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      description,
      type,
      instructor,
      dayOfWeek,
      startTime,
      endTime,
      duration,
      startDate,
      endDate,
      location,
      room,
      maxParticipants,
      registrationRequired = true,
      waitlistEnabled = false,
      skillLevel = "all_levels",
    } = req.body;

    // Let Mongoose handle schema validation so we return model-specific messages

    const gymSession = new GymSession({
      title,
      description,
      type,
      instructor,
      dayOfWeek,
      startTime,
      endTime,
      duration,
      startDate,
      endDate,
      location,
      room,
      maxParticipants,
      registrationRequired,
      waitlistEnabled,
      skillLevel,
      createdBy: req.user._id || req.user.id,
    });

    await gymSession.save();

    res.status(201).json({ success: true, message: "Gym session created", data: gymSession });
  } catch (error) {
    console.error("Error creating gym session:", error);
    // If validation error from Mongoose, return 400 with detailed messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => ({ message: err.message, field: err.path }));
      return res.status(400).json({ success: false, errors });
    }

    res.status(500).json({ success: false, message: "Error creating gym session", error: error.message });
  }
};

// @desc    Update an existing gym session
// @route   PUT /api/gym/sessions/:id
// @access  Private (admin or events_office)
const updateGymSession = async (req, res) => {
  try {
    const sessionId = req.params.id;

    // Validate request errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const updateData = req.body;

    // Load existing session and apply only the changed fields (shallow-merge objects)
    const session = await GymSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Gym session not found' });
    }

    // Apply updates: for plain objects do a shallow merge, for arrays/scalars replace entirely
    Object.keys(updateData).forEach((key) => {
      const val = updateData[key];

      // If both current value and incoming value are plain objects, shallow merge
      const current = session[key];
      const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

      if (isPlainObject(current) && isPlainObject(val)) {
        // merge shallowly so unspecified nested fields are preserved
        session[key] = { ...(typeof current.toObject === 'function' ? current.toObject() : current), ...val };
      } else {
        // otherwise, replace (covers arrays, scalars, nulls)
        session[key] = val;
      }
    });

    // Save with validators
    const saved = await session.save();

    res.status(200).json({ success: true, message: 'Gym session updated', data: saved });
  } catch (error) {
    console.error('Error updating gym session:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => ({ message: err.message, field: err.path }));
      return res.status(400).json({ success: false, errors });
    }
    res.status(500).json({ success: false, message: 'Error updating gym session', error: error.message });
  }
};

module.exports = {
  getGymSessions,
  getGymSessionsByMonth,
  getGymSessionsByDate,
  getGymSession,
  getGymSessionTypes,
  registerForGymSession,
  getUserGymRegistrations,
  cancelGymRegistration,
  getGymScheduleOverview,
  createGymSession,
  updateGymSession,
};

