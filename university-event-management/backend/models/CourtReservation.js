const mongoose = require("mongoose");

// Ensure User and Court models are loaded before this model
// This prevents "Schema hasn't been registered" errors in pre-save hooks
require("./User");
require("./Court");

const courtReservationSchema = new mongoose.Schema(
  {
    // User and Court Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    court: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Court",
      required: [true, "Court is required"],
    },

    // Reservation Details
    date: {
      type: Date,
      required: [true, "Reservation date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format"],
    },
    duration: {
      type: Number, // Duration in minutes
      required: [true, "Duration is required"],
      min: [30, "Duration must be at least 30 minutes"],
      max: [480, "Duration cannot exceed 480 minutes (8 hours)"],
    },

    // User Information (auto-populated from user)
    userName: {
      type: String,
      required: false, // Will be populated by pre-save hook
    },
    userEmail: {
      type: String,
      required: false, // Will be populated by pre-save hook
    },
    gucId: {
      type: String,
      required: false, // Will be populated by pre-save hook
    },
    userRole: {
      type: String,
      required: false, // Will be populated by pre-save hook
      enum: ["student", "staff", "ta", "professor"],
    },

    // Court Information (snapshot at time of booking)
    courtInfo: {
      courtName: String,
      courtType: String,
      location: String,
    },

    // Status Information
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed", "no_show"],
      default: "confirmed",
    },

    // Payment Information
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "waived"],
      default: "pending",
    },
    amountPaid: {
      type: Number,
      min: [0, "Amount paid cannot be negative"],
      default: 0,
    },
    discount: {
      type: Number,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
      default: 0,
    },
    finalAmount: {
      type: Number,
      min: [0, "Final amount cannot be negative"],
      default: 0,
    },

    // Cancellation Information
    cancellationReason: {
      type: String,
      maxlength: [300, "Cancellation reason cannot exceed 300 characters"],
    },
    cancellationDate: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Check-in/Check-out
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },

    // Additional Information
    purpose: {
      type: String,
      enum: ["practice", "match", "training", "event", "other"],
      default: "practice",
    },
    numberOfParticipants: {
      type: Number,
      min: [1, "Number of participants must be at least 1"],
      default: 1,
    },
    specialRequests: {
      type: String,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
    },
    equipment: [{
      type: String,
    }],

    // Administrative
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to prevent overlapping reservations
courtReservationSchema.index({ court: 1, date: 1, startTime: 1, endTime: 1 });
courtReservationSchema.index({ user: 1, date: 1 });
courtReservationSchema.index({ status: 1 });
courtReservationSchema.index({ date: 1 });

// Virtual for reservation date and time display
courtReservationSchema.virtual("dateTimeDisplay").get(function () {
  const dateStr = this.date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  return `${dateStr} from ${this.startTime} to ${this.endTime}`;
});

// Virtual for duration in hours
courtReservationSchema.virtual("durationHours").get(function () {
  return this.duration / 60;
});

// Pre-save middleware to populate user and court info
courtReservationSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Populate user information
      const User = mongoose.model("User");
      const user = await User.findById(this.user);
      
      if (user) {
        this.userName = `${user.firstName} ${user.lastName}`;
        this.userEmail = user.email;
        this.gucId = user.universityId || "N/A";
        this.userRole = user.role;
      }

      // Populate court information
      const Court = mongoose.model("Court");
      const court = await Court.findById(this.court);
      
      if (court) {
        this.courtInfo = {
          courtName: court.name,
          courtType: court.type,
          location: court.location,
        };
      }
    } catch (error) {
      console.error("Error populating reservation info:", error);
    }
  }
  next();
});

// Static method to check for overlapping reservations
courtReservationSchema.statics.hasOverlap = async function (courtId, date, startTime, endTime, excludeReservationId = null) {
  const query = {
    court: courtId,
    date: new Date(date),
    status: { $in: ["confirmed", "completed"] }, // Don't consider cancelled or no-show
    $or: [
      // New reservation starts during existing reservation
      { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
      // New reservation ends during existing reservation
      { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      // New reservation completely contains existing reservation
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
    ],
  };

  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const overlapping = await this.findOne(query);
  return !!overlapping;
};

// Static method to find user's reservations
courtReservationSchema.statics.findByUser = function (userId, filters = {}) {
  const query = { user: userId, ...filters };
  return this.find(query)
    .populate("court")
    .populate("user", "firstName lastName email universityId")
    .sort({ date: -1, startTime: -1 });
};

// Static method to find court's reservations
courtReservationSchema.statics.findByCourt = function (courtId, filters = {}) {
  const query = { court: courtId, ...filters };
  return this.find(query)
    .populate("user", "firstName lastName email universityId")
    .sort({ date: 1, startTime: 1 });
};

// Static method to find reservations by date
courtReservationSchema.statics.findByDate = function (date, filters = {}) {
  const query = { date: new Date(date), ...filters };
  return this.find(query)
    .populate("court")
    .populate("user", "firstName lastName email universityId")
    .sort({ startTime: 1 });
};

// Method to cancel reservation
courtReservationSchema.methods.cancelReservation = function (reason, cancelledBy) {
  this.status = "cancelled";
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  this.cancelledBy = cancelledBy;
  return this.save();
};

// Method to check if reservation can be cancelled
courtReservationSchema.methods.canBeCancelled = function (court) {
  if (this.status !== "confirmed") {
    return { allowed: false, reason: "Only confirmed reservations can be cancelled" };
  }

  const now = new Date();
  const reservationDateTime = new Date(this.date);
  const [hours, minutes] = this.startTime.split(':');
  reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  const hoursUntilReservation = (reservationDateTime - now) / (1000 * 60 * 60);

  if (hoursUntilReservation < 0) {
    return { allowed: false, reason: "Cannot cancel a past reservation" };
  }

  const cancellationDeadline = court?.bookingRules?.cancellationDeadline || 2;
  if (hoursUntilReservation < cancellationDeadline) {
    return { 
      allowed: false, 
      reason: `Cancellation must be at least ${cancellationDeadline} hours before the reservation` 
    };
  }

  return { allowed: true };
};

// Method to mark as completed
courtReservationSchema.methods.markAsCompleted = function () {
  this.status = "completed";
  return this.save();
};

// Method to mark as no-show
courtReservationSchema.methods.markAsNoShow = function () {
  this.status = "no_show";
  return this.save();
};

module.exports = mongoose.model("CourtReservation", courtReservationSchema);
