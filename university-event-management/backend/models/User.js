const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
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
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    verificationEmail: {
      type: String,
      required: false, // Only required for staff, TA, professor during registration
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid verification email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't include password in queries by default
    },

    // Role and University Information
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: [
          "student",
          "staff",
          "ta",
          "professor",
          "admin",
          "events_office",
          "pending", // For users awaiting role verification
        ],
        message:
          "Role must be one of: student, staff, ta, professor, admin, events_office, pending",
      },
    },
    requestedRole: {
      type: String,
      required: false, // Only required for staff/TA/professor during registration
      enum: {
        values: ["student", "staff", "ta", "professor"],
        message: "Requested role must be one of: student, staff, ta, professor",
      },
    },
    approvedRole: {
      type: String,
      required: false, // Set when admin approves, before email verification
      enum: {
        values: ["staff", "ta", "professor"],
        message: "Approved role must be one of: staff, ta, professor",
      },
    },
    universityId: {
      type: String,
      // Required for regular university members; optional for admin/events_office
      required: function () {
        return !["admin", "events_office"].includes(this.role);
      },
      trim: true,
      match: [
        /^[A-Za-z0-9\-_\.]+$/,
        "University ID can only contain letters, numbers, and symbols (-, _, .)",
      ],
    },
    department: {
      type: String,
      required: false, // Made optional per requirements
      trim: true,
      maxlength: [100, "Department name cannot exceed 100 characters"],
    },
    yearOfStudy: {
      type: Number,
      required: false, // Made optional per requirements
      min: [1, "Year of study must be at least 1"],
      max: [10, "Year of study cannot exceed 10"],
    },

    // Contact Information
    phoneNumber: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[\d\s\-\(\)]{10,}$/,
        "Please provide a valid phone number",
      ],
    },

    // Profile Information
    profilePicture: {
      type: String, // URL to profile picture
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      trim: true,
    },

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    banReason: {
      type: String,
      default: null,
      maxlength: [500, "Ban reason cannot exceed 500 characters"],
    },
    bannedAt: {
      type: Date,
      default: null,
    },
    isRegistrationComplete: {
      type: Boolean,
      default: true, // Most users have complete registration
    },
    emailVerificationSent: {
      type: Boolean,
      default: false, // Tracks if verification email has been sent after admin approval
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },

    // Password Reset
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },

    // Preferences
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },

    // Login Tracking
    lastLogin: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },

    // Balance for payments
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },

    // Daily Reward System
    rewardPoints: {
      type: Number,
      default: 0,
      min: [0, "Reward points cannot be negative"],
    },
    lastDailyReward: {
      type: Date,
      default: null,
    },
    consecutiveDays: {
      type: Number,
      default: 0,
      min: [0, "Consecutive days cannot be negative"],
    },

    // Favorites: saved events
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

// Enforce unique universityId only when universityId exists and has a value
userSchema.index(
  { universityId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      universityId: { $exists: true, $type: "string" },
    },
  }
);

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash password if it's been modified
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by university ID
userSchema.statics.findByUniversityId = function (universityId) {
  return this.findOne({ universityId });
};

module.exports = mongoose.model("User", userSchema);
