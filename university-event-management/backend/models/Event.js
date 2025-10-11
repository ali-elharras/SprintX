const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // Basic Event Information
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Event title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [2000, "Event description cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      required: [true, "Event type is required"],
      enum: {
        values: ["workshop", "trip", "bazaar", "competition", "conference"],
        message:
          "Event type must be one of: workshop, trip, bazaar, competition, conference",
      },
    },

    // Event Details
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
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
      maxlength: [300, "Location cannot exceed 300 characters"],
    },
    venue: {
      type: String,
      trim: true,
      maxlength: [200, "Venue cannot exceed 200 characters"],
    },

    // Registration Details
    registrationRequired: {
      type: Boolean,
      default: true,
    },
    registrationDeadline: {
      type: Date,
      required: function () {
        return this.registrationRequired;
      },
    },
    maxParticipants: {
      type: Number,
      min: [1, "Maximum participants must be at least 1"],
      required: function () {
        return this.registrationRequired;
      },
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, "Current participants cannot be negative"],
    },

    // Eligibility
    eligibleRoles: {
      type: [String],
      enum: ["student", "staff", "ta", "professor"],
      default: ["student", "staff", "ta", "professor"],
    },
    eligibleDepartments: {
      type: [String],
      default: [],
    },

    // Event Management
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Event organizer is required"],
    },
    organizerDetails: {
      name: String,
      email: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "draft",
    },

    // Additional Information
    prerequisites: {
      type: String,
      trim: true,
      maxlength: [1000, "Prerequisites cannot exceed 1000 characters"],
    },
    materials: {
      type: String,
      trim: true,
      maxlength: [1000, "Materials information cannot exceed 1000 characters"],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },

    // Special fields for trips
    itinerary: {
      type: String,
      required: function () {
        return this.type === "trip";
      },
      trim: true,
      maxlength: [3000, "Itinerary cannot exceed 3000 characters"],
    },
    transportation: {
      type: String,
      required: function () {
        return this.type === "trip";
      },
      trim: true,
      maxlength: [500, "Transportation details cannot exceed 500 characters"],
    },

    // Special fields for workshops
    instructor: {
      type: String,
      required: function () {
        return this.type === "workshop";
      },
      trim: true,
      maxlength: [200, "Instructor name cannot exceed 200 characters"],
    },
    duration: {
      type: Number,
      required: function () {
        return this.type === "workshop";
      },
      min: [0.5, "Duration must be at least 0.5 hours"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// === Virtuals ===

// Is registration still open?
eventSchema.virtual("isRegistrationOpen").get(function () {
  if (!this.registrationRequired) return false;
  const now = new Date();
  return (
    this.status === "published" &&
    this.registrationDeadline > now &&
    this.currentParticipants < this.maxParticipants
  );
});

// Available spots left
eventSchema.virtual("availableSpots").get(function () {
  if (!this.registrationRequired) return null;
  return this.maxParticipants - this.currentParticipants;
});

// Registration expired?
eventSchema.virtual("isRegistrationExpired").get(function () {
  if (!this.registrationRequired) return false;
  return new Date() > this.registrationDeadline;
});

// === Indexes ===
eventSchema.index({ type: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ registrationDeadline: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ eligibleRoles: 1 });
eventSchema.index({ tags: 1 });

// === Static Methods ===
eventSchema.statics.findUpcoming = function () {
  return this.find({
    status: "published",
    startDate: { $gte: new Date() },
  }).sort({ startDate: 1 });
};

eventSchema.statics.findByType = function (type) {
  return this.find({
    type,
    status: "published",
  }).sort({ startDate: 1 });
};

// === Instance Methods ===
eventSchema.methods.canUserRegister = function (user) {
  if (!this.isRegistrationOpen) return false;
  if (!this.eligibleRoles.includes(user.role)) return false;
  if (
    this.eligibleDepartments.length > 0 &&
    !this.eligibleDepartments.includes(user.department)
  ) {
    return false;
  }
  return true;
};

module.exports = mongoose.model("Event", eventSchema);
