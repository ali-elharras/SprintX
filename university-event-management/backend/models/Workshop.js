const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    // Basic Workshop Information
    workshopName: {
      type: String,
      required: [true, "Workshop name is required"],
      trim: true,
      unique: true,
    },
    shortDescription: {
      type: String,
      required: [true, "A short description is required"],
      maxlength: [200, "Short description cannot exceed 200 characters"],
      trim: true,
    },
    location: {
      type: String,
      enum: ["GUC Cairo", "GUC Berlin"],
      required: [true, "Location (GUC Cairo or GUC Berlin) is required"],
    },
    
    // Schedule and Duration
    startDate: {
      type: Date,
      required: [true, "Workshop start date and time is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Workshop end date and time is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date and time must be after the start date and time",
      },
    },

    // Detailed Content
    fullAgenda: {
      type: String,
      required: [true, "A full agenda is required"],
      // No max length to allow for detailed multi-day schedules
    },

    // Personnel
    facultyResponsible: {
      type: String,
      enum: ["MET", "IET", "MGT", "PHAR", "ARCH", "ART", "Other"], // Example faculties, customize as needed
      required: [true, "Responsible faculty is required (e.g., MET, IET)"],
    },
    professorsParticipating: [
      {
        type: String, // Use String for professor names, or ObjectId if referencing a 'Professor' model
        trim: true,
      },
    ],

    // Logistics and Resources
    capacity: {
      type: Number,
      required: [true, "Capacity (max attendees) is required"],
      min: [1, "Capacity must be at least 1"],
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Registration deadline is required"],
    },
    extraRequiredResources: {
      type: String,
      maxlength: [500, "Extra resources description cannot exceed 500 characters"],
      default: "",
    },

    // Budget and Funding
    requiredBudget: {
      type: Number,
      min: [0, "Budget cannot be negative"],
      required: [true, "Required budget is necessary for approval"],
    },
    fundingSource: {
      type: String,
      enum: ["External", "GUC", "Joint"],
      required: [true, "Funding source (external or GUC) is required"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// an index for better search performance by date and location
workshopSchema.index({ startDate: 1, location: 1 });
workshopSchema.index({ registrationDeadline: 1 });

// Status to indicate whether professor-submitted workshop is pending approval
workshopSchema.add({
  status: {
    type: String,
    enum: ["pending", "published", "rejected", "needs_revision"],
    default: "pending",
  },
  // link to the published Event (if published)
  publishedEventId: {
    type: String,
  },
  // Edit requests from Events Office to professors
  editRequests: {
    type: [
      {
        message: { type: String, required: true },
        requestedBy: {
          id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
          name: { type: String },
        },
        requestedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["needs_revision"], default: "needs_revision" },
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Workshop", workshopSchema);