const Court = require("../models/Court");
const CourtReservation = require("../models/CourtReservation");
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
    
    // Get day of week and operating hours
    const dayOfWeek = requestDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayOfWeekLower = dayOfWeek.toLowerCase();
    const operatingHours = court.operatingHours[dayOfWeekLower];
    
    // Check court status
    let unavailabilityReason = null;
    if (court.status !== "active") {
      unavailabilityReason = court.status === "maintenance" 
        ? "Court is currently under maintenance"
        : court.status === "closed" 
          ? "Court is permanently closed"
          : "Court is under construction";
    }
    
    // Check if court is open on this day
    if (!unavailabilityReason && !operatingHours.isOpen) {
      unavailabilityReason = `Court is closed on ${dayOfWeek}s`;
    }
    
    // Check for scheduled maintenance
    if (!unavailabilityReason) {
      const hasMaintenanceConflict = court.maintenanceSchedule.some(maintenance => {
        return requestDate >= maintenance.startDate && requestDate <= maintenance.endDate;
      });
      
      if (hasMaintenanceConflict) {
        const maintenanceInfo = court.maintenanceSchedule.find(maintenance => 
          requestDate >= maintenance.startDate && requestDate <= maintenance.endDate
        );
        unavailabilityReason = maintenanceInfo?.reason 
          ? `Scheduled maintenance: ${maintenanceInfo.reason}`
          : "Court has scheduled maintenance on this date";
      }
    }
    
    const availableSlots = court.getAvailableSlots(date);
    
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
        courtStatus: court.status,
        unavailabilityReason,
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

// @desc    Reserve a court
// @route   POST /api/courts/:id/reserve
// @access  Private (Student/Staff/TA/Professor)
const reserveCourt = async (req, res) => {
  try {
    const { id: courtId } = req.params;
    const userId = req.user.id;
    const { 
      date, 
      startTime, 
      endTime,
      purpose = "practice",
      numberOfParticipants = 1,
      specialRequests,
      equipment = []
    } = req.body;

    console.log('=== Court Reservation Request ===');
    console.log('Court ID:', courtId);
    console.log('User ID:', userId);
    console.log('Date:', date);
    console.log('Start Time:', startTime);
    console.log('End Time:', endTime);
    console.log('Purpose:', purpose);

    // Validate input
    if (!date || !startTime || !endTime) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({
        success: false,
        message: "Date, start time, and end time are required",
      });
    }

    // Check if court exists
    const court = await Court.findById(courtId);
    if (!court) {
      console.log('Validation failed: Court not found');
      return res.status(404).json({
        success: false,
        message: "Court not found",
      });
    }

    console.log('Court found:', court.name);

    // Check if court is active
    if (court.status !== "active") {
      console.log('Validation failed: Court not active, status:', court.status);
      return res.status(400).json({
        success: false,
        message: `Court is currently ${court.status} and cannot be reserved`,
      });
    }

    // Validate date is in the future (or today)
    // Parse date string as local date to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const reservationDate = new Date(year, month - 1, day); // month is 0-indexed
    reservationDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('Reservation date:', reservationDate);
    console.log('Today:', today);
    console.log('Date comparison:', reservationDate >= today);
    
    if (reservationDate < today) {
      console.log('Validation failed: Past date');
      return res.status(400).json({
        success: false,
        message: "Cannot reserve for past dates",
      });
    }

    // Check advance booking limit
    const maxAdvanceDays = court.bookingRules.advanceBookingDays;
    const maxDate = new Date();
    maxDate.setHours(0, 0, 0, 0);
    maxDate.setDate(maxDate.getDate() + maxAdvanceDays);
    
    console.log('Max advance days:', maxAdvanceDays);
    console.log('Max date:', maxDate);
    
    if (reservationDate > maxDate) {
      console.log('Validation failed: Too far in advance');
      return res.status(400).json({
        success: false,
        message: `Cannot book more than ${maxAdvanceDays} days in advance`,
      });
    }

    // Check if court is available at requested time
    console.log('Checking court availability...');
    const isAvailable = court.isAvailableAt(date, startTime, endTime);
    console.log('Court available:', isAvailable);
    
    if (!isAvailable) {
      console.log('Validation failed: Court not available at requested time');
      return res.status(400).json({
        success: false,
        message: "Court is not available at the requested time",
      });
    }

    // Calculate duration
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const duration = endMinutes - startMinutes;

    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Check maximum booking duration
    const maxDurationMinutes = court.bookingRules.maxBookingDuration * 60;
    if (duration > maxDurationMinutes) {
      return res.status(400).json({
        success: false,
        message: `Maximum booking duration is ${court.bookingRules.maxBookingDuration} hours`,
      });
    }

    // Check for overlapping reservations
    const hasOverlap = await CourtReservation.hasOverlap(courtId, date, startTime, endTime);
    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already reserved",
      });
    }

    // Check user's daily booking limit
    const userReservationsToday = await CourtReservation.countDocuments({
      user: userId,
      date: reservationDate,
      status: "confirmed",
    });

    if (userReservationsToday >= court.bookingRules.maxDailyBookings) {
      return res.status(400).json({
        success: false,
        message: `You have reached the maximum of ${court.bookingRules.maxDailyBookings} reservations per day`,
      });
    }

    // Calculate pricing
    const hourlyRate = court.pricing.hourlyRate || 0;
    const baseAmount = (duration / 60) * hourlyRate;
    
    let discount = 0;
    if (req.user.role === "student") {
      discount = court.pricing.studentDiscount || 0;
    } else if (["staff", "ta", "professor"].includes(req.user.role)) {
      discount = court.pricing.staffDiscount || 0;
    }

    const finalAmount = baseAmount * (1 - discount / 100);

    // Create reservation
    const reservation = new CourtReservation({
      user: userId,
      court: courtId,
      date: reservationDate,
      startTime,
      endTime,
      duration,
      purpose,
      numberOfParticipants,
      specialRequests,
      equipment,
      amountPaid: finalAmount,
      discount,
      finalAmount,
      paymentStatus: finalAmount === 0 ? "waived" : "pending",
      createdBy: userId,
    });

    await reservation.save();

    // Populate the reservation before sending response
    await reservation.populate("court");
    await reservation.populate("user", "firstName lastName email universityId role");

    // Create notification for user
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: userId,
        type: 'court_reservation_confirmed',
        title: 'Court Reservation Confirmed',
        message: `Your reservation for ${court.name} (${court.type}) on ${reservationDate.toLocaleDateString()} from ${startTime} to ${endTime} has been confirmed.`,
        relatedEntity: {
          entityType: 'CourtReservation',
          entityId: reservation._id
        },
        priority: 'normal'
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the reservation if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Court reserved successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Error reserving court:", error);
    res.status(500).json({
      success: false,
      message: "Error reserving court",
      error: error.message,
    });
  }
};

// @desc    Get user's court reservations
// @route   GET /api/courts/reservations
// @access  Private
const getUserReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, upcoming = false, past = false } = req.query;
    
    let filters = {};
    if (status) {
      filters.status = status;
    }

    let reservations = await CourtReservation.findByUser(userId, filters);

    // Filter by time
    if (upcoming === "true") {
      const now = new Date();
      reservations = reservations.filter(res => new Date(res.date) >= now);
    } else if (past === "true") {
      const now = new Date();
      reservations = reservations.filter(res => new Date(res.date) < now);
    }

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reservations",
      error: error.message,
    });
  }
};

// @desc    Get reservations for a specific court
// @route   GET /api/courts/:id/reservations
// @access  Private (Admin/Manager)
const getCourtReservations = async (req, res) => {
  try {
    const { id: courtId } = req.params;
    const { date, status } = req.query;

    let filters = {};
    if (status) {
      filters.status = status;
    }
    if (date) {
      filters.date = new Date(date);
    }

    const reservations = await CourtReservation.findByCourt(courtId, filters);

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching court reservations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching court reservations",
      error: error.message,
    });
  }
};

// @desc    Get available time slots for a court
// @route   GET /api/courts/:id/available-slots/:date
// @access  Public
const getAvailableSlots = async (req, res) => {
  try {
    const { id: courtId, date } = req.params;

    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: "Court not found",
      });
    }

    // Get all potential slots
    const allSlots = court.getAvailableSlots(date);

    // Get existing reservations for this date
    const reservations = await CourtReservation.find({
      court: courtId,
      date: new Date(date),
      status: { $in: ["confirmed", "completed"] },
    }).select("startTime endTime");

    // Mark slots as unavailable if they overlap with reservations
    const availableSlots = allSlots.map(slot => {
      const isReserved = reservations.some(reservation => {
        return (
          (slot.startTime >= reservation.startTime && slot.startTime < reservation.endTime) ||
          (slot.endTime > reservation.startTime && slot.endTime <= reservation.endTime) ||
          (slot.startTime <= reservation.startTime && slot.endTime >= reservation.endTime)
        );
      });

      return {
        ...slot,
        available: slot.available && !isReserved,
        reserved: isReserved,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        courtId: court._id,
        courtName: court.name,
        date,
        slots: availableSlots,
        totalSlots: availableSlots.length,
        availableCount: availableSlots.filter(s => s.available).length,
      },
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available slots",
      error: error.message,
    });
  }
};

// @desc    Cancel a court reservation
// @route   DELETE /api/courts/reservations/:id
// @access  Private
const cancelReservation = async (req, res) => {
  try {
    const { id: reservationId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const reservation = await CourtReservation.findOne({
      _id: reservationId,
      user: userId,
    }).populate("court");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // Check if reservation can be cancelled
    const canCancel = reservation.canBeCancelled(reservation.court);
    if (!canCancel.allowed) {
      return res.status(400).json({
        success: false,
        message: canCancel.reason,
      });
    }

    // Cancel the reservation
    await reservation.cancelReservation(reason || "Cancelled by user", userId);

    // Create notification
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: userId,
        type: 'court_reservation_cancelled',
        title: 'Court Reservation Cancelled',
        message: `Your reservation for ${reservation.courtInfo.courtName} on ${reservation.date.toLocaleDateString()} has been cancelled.`,
        relatedEntity: {
          entityType: 'CourtReservation',
          entityId: reservation._id
        },
        priority: 'normal'
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling reservation",
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
  reserveCourt,
  getUserReservations,
  getCourtReservations,
  getAvailableSlots,
  cancelReservation,
};