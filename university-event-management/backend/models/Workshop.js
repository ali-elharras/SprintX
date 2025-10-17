const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
  {
    // Basic Workshop Information
    workshopName: {
      type: String,
      required: [true, "Workshop name is required"],
      trim: true,
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

// Indexes for better search performance
workshopSchema.index({ startDate: 1, location: 1 });
workshopSchema.index({ registrationDeadline: 1 });
// Note: workshopName uniqueness is handled at application level in the controller,
// NOT at schema level, to avoid validation issues during updates

// Cleanup: Drop any existing unique index on workshopName on schema initialization
workshopSchema.post('syncIndexes', async function() {
  try {
    const collection = this.collection;
    const indexes = await collection.getIndexes();
    
    for (const [indexName, indexSpec] of Object.entries(indexes)) {
      // Find and remove any unique index on workshopName
      if (indexSpec.unique === true && indexSpec.key && indexSpec.key.workshopName === 1) {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped problematic workshopName unique index: ${indexName}`);
      }
    }
  } catch (error) {
    // Silently ignore errors in index cleanup
    if (error.message && !error.message.includes('no index found')) {
      console.warn('⚠️ Note: Database index cleanup may be needed, but not critical');
    }
  }
});

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
  // Reference to the professor who created this workshop
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for backwards compatibility
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