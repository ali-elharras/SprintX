const Court = require("../models/Court");
const { validationResult } = require("express-validator");

// @desc    Get all courts
// @route   GET /api/courts
// @access  Public
const getCourts = async (req, res) => {
  try {
    const { type, status = "active", available = false, date } = req.query;
    
    let query = { status };
    
    if (type) {
      query.type = type;
    }
    
    let courts;
    
    if (available === "true" && date) {
      // Get courts available on specific date
      courts = await Court.findAvailable(date, "06:00", "22:00")
        .populate("manager", "firstName lastName email")
        .populate("createdBy", "firstName lastName email")
        .sort({ type: 1, name: 1 });
    } else {
      courts = await Court.find(query)
        .populate("manager", "firstName lastName email")
        .populate("createdBy", "firstName lastName email")
        .sort({ type: 1, name: 1 });
    }
    
    res.status(200).json({
      success: true,
      count: courts.length,
      data: courts,
    });
  } catch (error) {
    console.error("Error fetching courts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courts",
      error: error.message,
    });
  }
};

// @desc    Get single court
// @route   GET /api/courts/:id
// @access  Public
const getCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate("manager", "firstName lastName email phone")
      .populate("createdBy", "firstName lastName email");
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: "Court not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: court,
    });
  } catch (error) {
    console.error("Error fetching court:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching court",
      error: error.message,
    });
  }
};

// @desc    Get courts by type
// @route   GET /api/courts/type/:type
// @access  Public
const getCourtsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const courts = await Court.findByType(type)
      .populate("manager", "firstName lastName email");
    
    res.status(200).json({
      success: true,
      count: courts.length,
      data: courts,
    });
  } catch (error) {
    console.error("Error fetching courts by type:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courts by type",
      error: error.message,
    });
  }
};

// @desc    Get court availability for specific date
// @route   GET /api/courts/:id/availability/:date
// @access  Public
const getCourtAvailability = async (req, res) => {
  try {
    const { id, date } = req.params;
    
    const court = await Court.findById(id);
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: "Court not found",
      });
    }
    
    // Validate date format
    const requestDate = new Date(date);
    if (isNaN(requestDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }
    
    // Check if date is in the future (or today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot check availability for past dates",
      });
    }
    
    // Check if date is within booking advance limit
    const maxAdvanceDays = court.bookingRules.advanceBookingDays;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
    if (requestDate > maxDate) {
      return res.status(400).json({
        success: false,
        message: `Cannot book more than ${maxAdvanceDays} days in advance`,
      });
    }
    
    const availableSlots = court.getAvailableSlots(date);
    const dayOfWeek = requestDate.toLocaleDateString('en-US', { weekday: 'long' });
    const operatingHours = court.todayHours;
    
    res.status(200).json({
      success: true,
      data: {
        courtId: court._id,
        courtName: court.name,
        date,
        dayOfWeek,
        operatingHours,
        slotDuration: court.slotDuration,
        availableSlots,
        totalSlots: availableSlots.length,
        availableSlotsCount: availableSlots.filter(slot => slot.available).length,
      },
    });
  } catch (error) {
    console.error("Error fetching court availability:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching court availability",
      error: error.message,
    });
  }
};

// @desc    Get weekly availability for a court
// @route   GET /api/courts/:id/weekly-availability
// @access  Public
const getWeeklyAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate } = req.query;
    
    const court = await Court.findById(id);
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: "Court not found",
      });
    }
    
    const start = startDate ? new Date(startDate) : new Date();
    const weeklyAvailability = [];
    
    // Get availability for 7 days starting from startDate
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      const slots = court.getAvailableSlots(dateString);
      
      weeklyAvailability.push({
        date: dateString,
        dayOfWeek,
        availableSlots: slots.filter(slot => slot.available).length,
        totalSlots: slots.length,
        operatingHours: court.operatingHours[dayOfWeek.toLowerCase()],
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        courtId: court._id,
        courtName: court.name,
        weeklyAvailability,
      },
    });
  } catch (error) {
    console.error("Error fetching weekly availability:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching weekly availability",
      error: error.message,
    });
  }
};

// @desc    Create new court
// @route   POST /api/courts
// @access  Private (Admin only)
const createCourt = async (req, res) => {
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

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can create courts",
      });
    }

    const court = await Court.create({
      ...req.body,
      createdBy: req.user.id,
      manager: req.body.manager || req.user.id, // Default to creator if no manager specified
    });

    await court.populate("manager", "firstName lastName email");
    await court.populate("createdBy", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Court created successfully",
      data: court,
    });
  } catch (error) {
    console.error("Error creating court:", error);
    res.status(500).json({
      success: false,
      message: "Error creating court",
      error: error.message,
    });
  }
};

// @desc    Update court
// @route   PUT /api/courts/:id
// @access  Private (Admin/Manager)
const updateCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: "Court not found",
      });
    }
    
    // Check if user is authorized to update this court
    if (
      court.manager.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this court",
      });
    }
    
    const updatedCourt = await Court.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("manager", "firstName lastName email")
      .populate("createdBy", "firstName lastName email");
    
    res.status(200).json({
      success: true,
      message: "Court updated successfully",
      data: updatedCourt,
    });
  } catch (error) {
    console.error("Error updating court:", error);
    res.status(500).json({
      success: false,
      message: "Error updating court",
      error: error.message,
    });
  }
};

// @desc    Delete court
// @route   DELETE /api/courts/:id
// @access  Private (Admin only)
const deleteCourt = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    
    if (!court) {
      return res.status(404).json({
        success: false,
        message: "Court not found",
      });
    }
    
    // Only admin can delete courts
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can delete courts",
      });
    }
    
    await Court.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Court deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting court:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting court",
      error: error.message,
    });
  }
};

// @desc    Get court statistics
// @route   GET /api/courts/stats
// @access  Public
const getCourtStats = async (req, res) => {
  try {
    const stats = await Court.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }
          },
          averageCapacity: { $avg: "$capacity" },
          averageHourlyRate: { $avg: "$pricing.hourlyRate" },
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalCourts = await Court.countDocuments();
    const activeCourts = await Court.countDocuments({ status: "active" });
    const courtTypes = await Court.distinct("type");

    res.status(200).json({
      success: true,
      data: {
        totalCourts,
        activeCourts,
        courtTypes,
        statsByType: stats,
      },
    });
  } catch (error) {
    console.error("Error fetching court stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching court statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getCourts,
  getCourt,
  getCourtsByType,
  getCourtAvailability,
  getWeeklyAvailability,
  createCourt,
  updateCourt,
  deleteCourt,
  getCourtStats,
};