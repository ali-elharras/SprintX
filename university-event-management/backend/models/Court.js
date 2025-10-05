const mongoose = require("mongoose");

const courtSchema = new mongoose.Schema(
  {
    // Basic Court Information
    name: {
      type: String,
      required: [true, "Court name is required"],
      trim: true,
      maxlength: [100, "Court name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Court type is required"],
      enum: {
        values: ["basketball", "tennis", "football"],
        message: "Court type must be one of: basketball, tennis, football",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // Location Information
    location: {
      type: String,
      required: [true, "Court location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },
    building: {
      type: String,
      trim: true,
      maxlength: [100, "Building name cannot exceed 100 characters"],
    },
    floor: {
      type: String,
      trim: true,
      maxlength: [20, "Floor cannot exceed 20 characters"],
    },

    // Court Specifications
    capacity: {
      type: Number,
      required: [true, "Court capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [100, "Capacity cannot exceed 100"],
    },
    surface: {
      type: String,
      enum: ["grass", "hardcourt", "clay", "artificial_turf", "indoor_court"],
      required: [true, "Court surface is required"],
    },
    dimensions: {
      length: {
        type: Number,
        min: [1, "Length must be positive"],
      },
      width: {
        type: Number,
        min: [1, "Width must be positive"],
      },
      unit: {
        type: String,
        enum: ["meters", "feet"],
        default: "meters",
      },
    },

    // Facilities and Equipment
    facilities: [{
      type: String,
      enum: [
        "lighting",
        "changing_rooms",
        "showers",
        "lockers",
        "seating",
        "scoreboard",
        "sound_system",
        "first_aid",
        "parking",
        "accessible",
        "equipment_rental",
        "refreshments"
      ],
    }],
    equipmentAvailable: [{
      type: String,
      enum: [
        "balls",
        "rackets",
        "nets",
        "goals",
        "cones",
        "bibs",
        "first_aid_kit",
        "whistle"
      ],
    }],

    // Availability Configuration
    operatingHours: {
      monday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" }, // Format: "HH:MM"
        closeTime: { type: String, default: "22:00" },
      },
      tuesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" },
      },
      wednesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" },
      },
      thursday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" },
      },
      friday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" },
      },
      saturday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "08:00" },
        closeTime: { type: String, default: "20:00" },
      },
      sunday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "08:00" },
        closeTime: { type: String, default: "20:00" },
      },
    },

    // Time slot configuration
    slotDuration: {
      type: Number, // Duration in minutes
      default: 60,
      min: [30, "Slot duration must be at least 30 minutes"],
      max: [240, "Slot duration cannot exceed 240 minutes"],
    },

    // Booking Rules
    bookingRules: {
      advanceBookingDays: {
        type: Number,
        default: 7,
        min: [1, "Must allow at least 1 day advance booking"],
        max: [30, "Cannot allow more than 30 days advance booking"],
      },
      maxBookingDuration: {
        type: Number, // in hours
        default: 2,
        min: [0.5, "Maximum booking duration must be at least 30 minutes"],
        max: [8, "Maximum booking duration cannot exceed 8 hours"],
      },
      maxDailyBookings: {
        type: Number,
        default: 2,
        min: [1, "Must allow at least 1 booking per day"],
        max: [10, "Cannot allow more than 10 bookings per day"],
      },
      cancellationDeadline: {
        type: Number, // hours before booking
        default: 2,
        min: [0, "Cancellation deadline cannot be negative"],
        max: [48, "Cancellation deadline cannot exceed 48 hours"],
      },
    },

    // Cost and Pricing
    pricing: {
      hourlyRate: {
        type: Number,
        default: 0,
        min: [0, "Hourly rate cannot be negative"],
      },
      currency: {
        type: String,
        default: "EGP",
        maxlength: [3, "Currency code cannot exceed 3 characters"],
      },
      studentDiscount: {
        type: Number, // percentage
        default: 0,
        min: [0, "Student discount cannot be negative"],
        max: [100, "Student discount cannot exceed 100%"],
      },
      staffDiscount: {
        type: Number, // percentage
        default: 0,
        min: [0, "Staff discount cannot be negative"],
        max: [100, "Staff discount cannot exceed 100%"],
      },
    },

    // Status and Maintenance
    status: {
      type: String,
      enum: ["active", "maintenance", "closed", "under_construction"],
      default: "active",
    },
    maintenanceSchedule: [{
      startDate: Date,
      endDate: Date,
      reason: String,
      description: String,
    }],

    // Management
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Court manager is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },

    // Additional Information
    images: [{
      type: String, // URLs to court images
    }],
    contactInfo: {
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    rules: {
      type: String,
      maxlength: [1000, "Rules cannot exceed 1000 characters"],
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for current availability status
courtSchema.virtual("isCurrentlyAvailable").get(function () {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM" format
  
  const todayHours = this.operatingHours[currentDay];
  
  return (
    this.status === "active" &&
    todayHours.isOpen &&
    currentTime >= todayHours.openTime &&
    currentTime <= todayHours.closeTime
  );
});

// Virtual for today's operating hours
courtSchema.virtual("todayHours").get(function () {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return this.operatingHours[currentDay];
});

// Indexes for better performance
courtSchema.index({ type: 1 });
courtSchema.index({ status: 1 });
courtSchema.index({ location: 1 });
courtSchema.index({ manager: 1 });
courtSchema.index({ "pricing.hourlyRate": 1 });

// Static method to find available courts
courtSchema.statics.findAvailable = function (date, startTime, endTime) {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  return this.find({
    status: "active",
    [`operatingHours.${dayOfWeek}.isOpen`]: true,
    [`operatingHours.${dayOfWeek}.openTime`]: { $lte: startTime },
    [`operatingHours.${dayOfWeek}.closeTime`]: { $gte: endTime },
  });
};

// Static method to find courts by type
courtSchema.statics.findByType = function (type) {
  return this.find({
    type,
    status: { $ne: "closed" },
  }).sort({ name: 1 });
};

// Method to check if court is available at specific time
courtSchema.methods.isAvailableAt = function (date, startTime, endTime) {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayHours = this.operatingHours[dayOfWeek];
  
  // Check if court is active and open on that day
  if (this.status !== "active" || !dayHours.isOpen) {
    return false;
  }
  
  // Check if requested time is within operating hours
  if (startTime < dayHours.openTime || endTime > dayHours.closeTime) {
    return false;
  }
  
  // Check if there's maintenance scheduled
  const requestDate = new Date(date);
  const hasMaintenanceConflict = this.maintenanceSchedule.some(maintenance => {
    return requestDate >= maintenance.startDate && requestDate <= maintenance.endDate;
  });
  
  return !hasMaintenanceConflict;
};

// Method to get available time slots for a specific date
courtSchema.methods.getAvailableSlots = function (date) {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayHours = this.operatingHours[dayOfWeek];
  
  if (this.status !== "active" || !dayHours.isOpen) {
    return [];
  }
  
  const slots = [];
  const openTime = this.parseTime(dayHours.openTime);
  const closeTime = this.parseTime(dayHours.closeTime);
  const slotDuration = this.slotDuration;
  
  let currentTime = openTime;
  while (currentTime + slotDuration <= closeTime) {
    const startTime = this.formatTime(currentTime);
    const endTime = this.formatTime(currentTime + slotDuration);
    
    slots.push({
      startTime,
      endTime,
      available: this.isAvailableAt(date, startTime, endTime)
    });
    
    currentTime += slotDuration;
  }
  
  return slots;
};

// Helper methods for time parsing and formatting
courtSchema.methods.parseTime = function (timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes; // Convert to minutes
};

courtSchema.methods.formatTime = function (minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

module.exports = mongoose.model("Court", courtSchema);