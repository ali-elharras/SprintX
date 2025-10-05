const mongoose = require("mongoose");

const gymSessionSchema = new mongoose.Schema(
  {
    // Session Information
    title: {
      type: String,
      required: [true, "Session title is required"],
      trim: true,
      maxlength: [100, "Session title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Session description cannot exceed 500 characters"],
    },
    type: {
      type: String,
      required: [true, "Session type is required"],
      enum: {
        values: [
          "yoga",
          "pilates",
          "aerobics",
          "zumba",
          "cross_circuit",
          "kickboxing",
          "cardio",
          "strength_training",
          "dance",
          "martial_arts",
          "swimming",
          "spinning"
        ],
        message: "Session type must be one of: yoga, pilates, aerobics, zumba, cross_circuit, kickboxing, cardio, strength_training, dance, martial_arts, swimming, spinning",
      },
    },

    // Instructor Information
    instructor: {
      name: {
        type: String,
        required: [true, "Instructor name is required"],
        trim: true,
        maxlength: [100, "Instructor name cannot exceed 100 characters"],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "Please provide a valid email address",
        ],
      },
      bio: {
        type: String,
        trim: true,
        maxlength: [300, "Instructor bio cannot exceed 300 characters"],
      },
      certifications: {
        type: [String],
        default: [],
      },
    },

    // Schedule Information
    dayOfWeek: {
      type: Number,
      required: [true, "Day of week is required"],
      min: [0, "Day of week must be between 0 and 6"],
      max: [6, "Day of week must be between 0 and 6"], // 0 = Sunday, 6 = Saturday
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
      min: [15, "Duration must be at least 15 minutes"],
      max: [180, "Duration cannot exceed 180 minutes"],
    },

    // Date Range (for recurring sessions)
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "End date must be after start date",
      },
    },

    // Location Information
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    room: {
      type: String,
      trim: true,
      maxlength: [50, "Room cannot exceed 50 characters"],
    },
    equipment: {
      type: [String],
      default: [],
    },

    // Capacity and Registration
    maxParticipants: {
      type: Number,
      required: [true, "Maximum participants is required"],
      min: [1, "Maximum participants must be at least 1"],
      max: [100, "Maximum participants cannot exceed 100"],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, "Current participants cannot be negative"],
    },
    registrationRequired: {
      type: Boolean,
      default: true,
    },
    waitlistEnabled: {
      type: Boolean,
      default: false,
    },

    // Eligibility
    eligibleRoles: {
      type: [String],
      enum: ["student", "staff", "ta", "professor"],
      default: ["student", "staff", "ta", "professor"],
    },
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all_levels"],
      default: "all_levels",
    },
    ageRestriction: {
      minAge: {
        type: Number,
        min: [16, "Minimum age cannot be less than 16"],
        max: [100, "Minimum age cannot exceed 100"],
        default: 16,
      },
      maxAge: {
        type: Number,
        min: [16, "Maximum age cannot be less than 16"],
        max: [100, "Maximum age cannot exceed 100"],
        default: 100,
      },
    },

    // Session Status
    status: {
      type: String,
      enum: ["active", "cancelled", "suspended", "full"],
      default: "active",
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },

    // Additional Information
    prerequisites: {
      type: String,
      trim: true,
      maxlength: [300, "Prerequisites cannot exceed 300 characters"],
    },
    benefits: {
      type: [String],
      default: [],
    },
    calories: {
      type: Number, // Estimated calories burned per session
      min: [0, "Calories cannot be negative"],
    },
    tags: {
      type: [String],
      default: [],
    },

    // Cost Information
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
      default: 0,
    },
    dropInAllowed: {
      type: Boolean,
      default: true,
    },
    dropInCost: {
      type: Number,
      min: [0, "Drop-in cost cannot be negative"],
      default: 0,
    },

    // Special Dates (holidays, cancellations, etc.)
    excludedDates: {
      type: [Date],
      default: [],
    },
    specialSchedule: [{
      date: {
        type: Date,
        required: true,
      },
      startTime: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format"],
      },
      endTime: {
        type: String,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format"],
      },
      status: {
        type: String,
        enum: ["cancelled", "rescheduled", "special"],
        default: "special",
      },
      note: {
        type: String,
        maxlength: [200, "Note cannot exceed 200 characters"],
      },
    }],

    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
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

// Virtual for available spots
gymSessionSchema.virtual("availableSpots").get(function () {
  return this.maxParticipants - this.currentParticipants;
});

// Virtual for session full status
gymSessionSchema.virtual("isFull").get(function () {
  return this.currentParticipants >= this.maxParticipants;
});

// Virtual for day name
gymSessionSchema.virtual("dayName").get(function () {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[this.dayOfWeek];
});

// Virtual for duration in hours
gymSessionSchema.virtual("durationHours").get(function () {
  return this.duration / 60;
});

// Indexes for better performance
gymSessionSchema.index({ type: 1 });
gymSessionSchema.index({ dayOfWeek: 1 });
gymSessionSchema.index({ startDate: 1, endDate: 1 });
gymSessionSchema.index({ status: 1 });
gymSessionSchema.index({ eligibleRoles: 1 });
gymSessionSchema.index({ instructor: 1 });
gymSessionSchema.index({ location: 1 });

// Static method to find sessions by type
gymSessionSchema.statics.findByType = function (type) {
  return this.find({
    type,
    status: "active",
  }).sort({ dayOfWeek: 1, startTime: 1 });
};

// Static method to find sessions for a specific month
gymSessionSchema.statics.findByMonth = function (year, month) {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  
  return this.find({
    status: "active",
    $or: [
      {
        // Sessions that start within the month
        startDate: { $gte: startOfMonth, $lte: endOfMonth }
      },
      {
        // Sessions that are ongoing during the month
        startDate: { $lte: startOfMonth },
        endDate: { $gte: endOfMonth }
      },
      {
        // Sessions that end within the month
        endDate: { $gte: startOfMonth, $lte: endOfMonth }
      }
    ]
  }).sort({ dayOfWeek: 1, startTime: 1 });
};

// Static method to find sessions by day of week
gymSessionSchema.statics.findByDayOfWeek = function (dayOfWeek) {
  return this.find({
    dayOfWeek,
    status: "active",
  }).sort({ startTime: 1 });
};

// Method to check if user can register
gymSessionSchema.methods.canUserRegister = function (user) {
  // Check if session is active
  if (this.status !== "active") return false;

  // Check if session is full
  if (this.isFull && !this.waitlistEnabled) return false;

  // Check role eligibility
  if (!this.eligibleRoles.includes(user.role)) return false;

  return true;
};

// Method to get sessions for a specific date
gymSessionSchema.statics.findByDate = function (date) {
  const dayOfWeek = date.getDay();
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return this.find({
    dayOfWeek,
    status: "active",
    startDate: { $lte: targetDate },
    endDate: { $gte: targetDate },
    excludedDates: { $nin: [targetDate] }
  }).sort({ startTime: 1 });
};

module.exports = mongoose.model("GymSession", gymSessionSchema);