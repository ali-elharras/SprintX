const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    // Event Reference
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event reference is required"],
    },

    // User Information (can be from existing user or manual entry)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional for external registrants
    },

    // Manual Registration Fields (for users not in the system)
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    universityId: {
      type: String,
      required: [true, "University/Staff ID is required"],
      trim: true,
      match: [
        /^[A-Za-z0-9]+$/,
        "University/Staff ID can only contain letters and numbers",
      ],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["student", "staff", "ta", "professor"],
        message: "Role must be one of: student, staff, ta, professor",
      },
    },

    // Additional Information
    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department name cannot exceed 100 characters"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[\d\s\-\(\)]{10,}$/,
        "Please provide a valid phone number",
      ],
    },
    yearOfStudy: {
      type: Number,
      required: function () {
        return this.role === "student";
      },
      min: [1, "Year of study must be at least 1"],
      max: [10, "Year of study cannot exceed 10"],
    },

    // Registration Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "attended", "no-show"],
      default: "confirmed", // Auto-confirm for now
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },

    // Special Requirements or Notes
    specialRequirements: {
      type: String,
      trim: true,
      maxlength: [500, "Special requirements cannot exceed 500 characters"],
    },
    dietaryRestrictions: {
      type: String,
      trim: true,
      maxlength: [300, "Dietary restrictions cannot exceed 300 characters"],
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
          "Please provide a valid emergency contact phone number",
        ],
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [50, "Relationship cannot exceed 50 characters"],
      },
    },

    // Payment Information (for paid events)
    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid", "refunded"],
      default: "not_required",
    },
    paymentAmount: {
      type: Number,
      min: [0, "Payment amount cannot be negative"],
      default: 0,
    },
    paymentDate: {
      type: Date,
    },

    // Check-in Information
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkInTime: {
      type: Date,
    },

    // Admin Notes
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
registrationSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ event: 1, email: 1 }, { unique: true });
registrationSchema.index({ event: 1, universityId: 1 }, { unique: true });

// Additional indexes for queries
registrationSchema.index({ user: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ registrationDate: 1 });

// Pre-save middleware to auto-populate from user if user ID is provided
registrationSchema.pre("save", async function (next) {
  if (this.user && this.isNew) {
    try {
      const User = mongoose.model("User");
      const user = await User.findById(this.user);
      if (user) {
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.email = user.email;
        this.universityId = user.universityId;
        this.role = user.role;
        this.department = user.department;
        this.yearOfStudy = user.yearOfStudy;
        this.phoneNumber = user.phoneNumber;
      }
    } catch (error) {
      // If user lookup fails, continue with manual data
      console.error("Error populating user data:", error);
    }
  }
  next();
});

// Post-save middleware to update event participant count
registrationSchema.post("save", async function (doc) {
  if (doc.status === "confirmed") {
    try {
      const Event = mongoose.model("Event");
      await Event.findByIdAndUpdate(doc.event, {
        $inc: { currentParticipants: 1 },
      });
    } catch (error) {
      console.error("Error updating event participant count:", error);
    }
  }
});

// Post-remove middleware to update event participant count
registrationSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.status === "confirmed") {
    try {
      const Event = mongoose.model("Event");
      await Event.findByIdAndUpdate(doc.event, {
        $inc: { currentParticipants: -1 },
      });
    } catch (error) {
      console.error("Error updating event participant count:", error);
    }
  }
});

// Static method to find registrations by event
registrationSchema.statics.findByEvent = function (eventId) {
  return this.find({ event: eventId }).populate("user", "firstName lastName email");
};

// Static method to find registrations by user
registrationSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId }).populate("event", "title type startDate location");
};

// Method to cancel registration
registrationSchema.methods.cancelRegistration = async function () {
  this.status = "cancelled";
  await this.save();
  
  // Update event participant count
  try {
    const Event = mongoose.model("Event");
    await Event.findByIdAndUpdate(this.event, {
      $inc: { currentParticipants: -1 },
    });
  } catch (error) {
    console.error("Error updating event participant count:", error);
  }
};

module.exports = mongoose.model("Registration", registrationSchema);