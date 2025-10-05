const mongoose = require("mongoose");

const gymRegistrationSchema = new mongoose.Schema(
  {
    // User and Session Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    gymSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GymSession",
      required: [true, "Gym session is required"],
    },

    // Registration Details
    registrationType: {
      type: String,
      enum: ["regular", "drop_in", "waitlist"],
      default: "regular",
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "End date must be after start date",
      },
    },

    // Status Information
    status: {
      type: String,
      enum: ["active", "cancelled", "completed", "no_show", "waitlisted"],
      default: "active",
    },
    attendanceRecord: [{
      date: {
        type: Date,
        required: true,
      },
      attended: {
        type: Boolean,
        required: true,
      },
      checkInTime: {
        type: Date,
      },
      checkOutTime: {
        type: Date,
      },
      notes: {
        type: String,
        maxlength: [200, "Notes cannot exceed 200 characters"],
      },
    }],

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
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "free", "scholarship"],
    },
    paymentDate: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: [0, "Refund amount cannot be negative"],
      default: 0,
    },
    refundDate: {
      type: Date,
    },

    // Waitlist Information
    waitlistPosition: {
      type: Number,
      min: [1, "Waitlist position must be at least 1"],
    },
    waitlistDate: {
      type: Date,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },

    // Special Requirements
    medicalConditions: {
      type: String,
      maxlength: [500, "Medical conditions cannot exceed 500 characters"],
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, "Emergency contact name cannot exceed 100 characters"],
      },
      phone: {
        type: String,
        trim: true,
        match: [
          /^[\+]?[\d\s\-\(\)]{10,}$/,
          "Please provide a valid phone number",
        ],
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [50, "Relationship cannot exceed 50 characters"],
      },
    },

    // Preferences
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      reminder24h: {
        type: Boolean,
        default: true,
      },
      reminder1h: {
        type: Boolean,
        default: false,
      },
    },

    // Feedback and Rating
    feedback: {
      rating: {
        type: Number,
        min: [1, "Rating must be between 1 and 5"],
        max: [5, "Rating must be between 1 and 5"],
      },
      comment: {
        type: String,
        maxlength: [500, "Feedback comment cannot exceed 500 characters"],
      },
      submittedAt: {
        type: Date,
      },
    },

    // Cancellation Information
    cancellationReason: {
      type: String,
      maxlength: [300, "Cancellation reason cannot exceed 300 characters"],
    },
    cancellationDate: {
      type: Date,
    },
    cancellationFee: {
      type: Number,
      min: [0, "Cancellation fee cannot be negative"],
      default: 0,
    },

    // Session-specific Information
    sessionInfo: {
      sessionTitle: String,
      sessionType: String,
      instructorName: String,
      location: String,
      dayOfWeek: Number,
      startTime: String,
      endTime: String,
    },

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

// Compound index to prevent duplicate registrations
gymRegistrationSchema.index({ user: 1, gymSession: 1 }, { unique: true });

// Other indexes for better performance
gymRegistrationSchema.index({ status: 1 });
gymRegistrationSchema.index({ registrationDate: 1 });
gymRegistrationSchema.index({ paymentStatus: 1 });
gymRegistrationSchema.index({ startDate: 1, endDate: 1 });
gymRegistrationSchema.index({ waitlistPosition: 1 });

// Virtual for total sessions attended
gymRegistrationSchema.virtual("sessionsAttended").get(function () {
  return this.attendanceRecord.filter(record => record.attended).length;
});

// Virtual for total sessions missed
gymRegistrationSchema.virtual("sessionsMissed").get(function () {
  return this.attendanceRecord.filter(record => !record.attended).length;
});

// Virtual for attendance rate
gymRegistrationSchema.virtual("attendanceRate").get(function () {
  const totalSessions = this.attendanceRecord.length;
  if (totalSessions === 0) return 0;
  return (this.sessionsAttended / totalSessions) * 100;
});

// Virtual for registration duration in days
gymRegistrationSchema.virtual("registrationDuration").get(function () {
  if (!this.endDate) return null;
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to populate session info
gymRegistrationSchema.pre("save", async function (next) {
  if (this.isNew && this.gymSession) {
    try {
      const GymSession = mongoose.model("GymSession");
      const session = await GymSession.findById(this.gymSession);
      
      if (session) {
        this.sessionInfo = {
          sessionTitle: session.title,
          sessionType: session.type,
          instructorName: session.instructor.name,
          location: session.location,
          dayOfWeek: session.dayOfWeek,
          startTime: session.startTime,
          endTime: session.endTime,
        };
      }
    } catch (error) {
      console.error("Error populating session info:", error);
    }
  }
  next();
});

// Static method to find registrations by user
gymRegistrationSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId })
    .populate("gymSession")
    .sort({ registrationDate: -1 });
};

// Static method to find active registrations for a session
gymRegistrationSchema.statics.findActiveBySession = function (sessionId) {
  return this.find({
    gymSession: sessionId,
    status: "active",
  })
    .populate("user", "firstName lastName email")
    .sort({ registrationDate: 1 });
};

// Static method to find waitlisted registrations for a session
gymRegistrationSchema.statics.findWaitlistBySession = function (sessionId) {
  return this.find({
    gymSession: sessionId,
    status: "waitlisted",
  })
    .populate("user", "firstName lastName email")
    .sort({ waitlistPosition: 1 });
};

// Method to cancel registration
gymRegistrationSchema.methods.cancelRegistration = function (reason, cancellationFee = 0) {
  this.status = "cancelled";
  this.cancellationReason = reason;
  this.cancellationDate = new Date();
  this.cancellationFee = cancellationFee;
  return this.save();
};

// Method to mark attendance
gymRegistrationSchema.methods.markAttendance = function (date, attended, checkInTime = null, checkOutTime = null, notes = "") {
  const attendanceEntry = {
    date: new Date(date),
    attended,
    checkInTime,
    checkOutTime,
    notes,
  };
  
  // Check if attendance for this date already exists
  const existingIndex = this.attendanceRecord.findIndex(
    record => record.date.toDateString() === attendanceEntry.date.toDateString()
  );
  
  if (existingIndex >= 0) {
    this.attendanceRecord[existingIndex] = attendanceEntry;
  } else {
    this.attendanceRecord.push(attendanceEntry);
  }
  
  return this.save();
};

// Method to add feedback
gymRegistrationSchema.methods.addFeedback = function (rating, comment) {
  this.feedback = {
    rating,
    comment,
    submittedAt: new Date(),
  };
  return this.save();
};

module.exports = mongoose.model("GymRegistration", gymRegistrationSchema);