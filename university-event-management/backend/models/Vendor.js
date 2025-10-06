const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const vendorSchema = new mongoose.Schema(
  {
    // Basic Information
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    contactPersonFirstName: {
      type: String,
      required: false, // Made optional per requirements
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    contactPersonLastName: {
      type: String,
      required: false, // Made optional per requirements
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
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't include password in queries by default
    },

    // Company Information
    businessRegistrationNumber: {
      type: String,
      required: false, // Made optional per requirements
      unique: true,
      sparse: true, // Allow multiple null values for unique field
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      required: false, // Made optional per requirements
      trim: true,
      maxlength: [100, "Industry cannot exceed 100 characters"],
    },
    companySize: {
      type: String,
      enum: {
        values: ["startup", "small", "medium", "large", "enterprise"],
        message:
          "Company size must be one of: startup, small, medium, large, enterprise",
      },
      required: false, // Made optional per requirements
    },

    // Contact Information
    phoneNumber: {
      type: String,
      required: false, // Made optional per requirements
      trim: true,
      match: [
        /^[\+]?[\d\s\-\(\)]{10,}$/,
        "Please provide a valid phone number",
      ],
    },
    alternatePhoneNumber: {
      type: String,
      trim: true,
      match: [
        /^[\+]?[\d\s\-\(\)]{10,}$/,
        "Please provide a valid alternate phone number",
      ],
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/.+/,
        "Please provide a valid website URL starting with http:// or https://",
      ],
    },

    // Address Information
    address: {
      street: {
        type: String,
        required: false, // Made optional per requirements
        trim: true,
        maxlength: [200, "Street address cannot exceed 200 characters"],
      },
      city: {
        type: String,
        required: false, // Made optional per requirements
        trim: true,
        maxlength: [50, "City cannot exceed 50 characters"],
      },
      state: {
        type: String,
        required: false, // Made optional per requirements
        trim: true,
        maxlength: [50, "State cannot exceed 50 characters"],
      },
      zipCode: {
        type: String,
        required: false, // Made optional per requirements
        trim: true,
        match: [/^[\d\-\s]{5,10}$/, "Please provide a valid zip code"],
      },
      country: {
        type: String,
        required: false, // Made optional per requirements
        trim: true,
        maxlength: [50, "Country cannot exceed 50 characters"],
      },
    },

    // Business Description
    description: {
      type: String,
      required: false, // Made optional per requirements
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    servicesOffered: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Service name cannot exceed 100 characters"],
      },
    ],

    // Event Participation
    interestedEventTypes: [
      {
        type: String,
        enum: ["bazaar", "career_fair", "conference", "workshop"],
        required: false, // Made optional per requirements
      },
    ],

    // Documentation
    documents: {
      businessLicense: {
        url: String,
        uploadedAt: Date,
        verified: {
          type: Boolean,
          default: false,
        },
      },
      taxCertificate: {
        url: String,
        uploadedAt: Date,
        verified: {
          type: Boolean,
          default: false,
        },
      },
      companyProfile: {
        url: String,
        uploadedAt: Date,
        verified: {
          type: Boolean,
          default: false,
        },
      },
    },

    // Verification Status
    /*
    verificationStatus: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "under_review"],
        message:
          "Verification status must be one of: pending, approved, rejected, under_review",
      },
      default: "pending",
    },
    */
    verificationNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Verification notes cannot exceed 500 characters"],
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Profile Information
    logo: {
      type: String, // URL to company logo
      default: null,
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

    // Login Tracking
    lastLogin: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for contact person full name
vendorSchema.virtual("contactPersonFullName").get(function () {
  return `${this.contactPersonFirstName} ${this.contactPersonLastName}`;
});

// Virtual for full address
vendorSchema.virtual("fullAddress").get(function () {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Index for better query performance
vendorSchema.index({ email: 1 });
vendorSchema.index({ businessRegistrationNumber: 1 });
vendorSchema.index({ verificationStatus: 1 });
vendorSchema.index({ interestedEventTypes: 1 });
vendorSchema.index({ "address.city": 1 });
vendorSchema.index({ industry: 1 });

// Pre-save middleware to hash password
vendorSchema.pre("save", async function (next) {
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
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to update last login
vendorSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Method to approve vendor
vendorSchema.methods.approve = function (approvedBy) {
  this.verificationStatus = "approved";
  this.verifiedBy = approvedBy;
  this.verifiedAt = new Date();
  return this.save();
};

// Method to reject vendor
vendorSchema.methods.reject = function (rejectedBy, notes) {
  this.verificationStatus = "rejected";
  this.verifiedBy = rejectedBy;
  this.verifiedAt = new Date();
  this.verificationNotes = notes;
  return this.save();
};

// Static method to find by email
vendorSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by business registration number
vendorSchema.statics.findByBusinessRegistration = function (
  businessRegistrationNumber
) {
  return this.findOne({ businessRegistrationNumber });
};

// Static method to find approved vendors
vendorSchema.statics.findApproved = function () {
  return this.find({ verificationStatus: "approved", isActive: true });
};

module.exports = mongoose.model("Vendor", vendorSchema);
