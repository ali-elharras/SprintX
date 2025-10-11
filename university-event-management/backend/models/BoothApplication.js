const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Attendee name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Attendee email is required"],
    trim: true,
    lowercase: true,
  },
});

const boothApplicationSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    attendees: {
      type: [attendeeSchema],
      validate: [
        (val) => val.length <= 5,
        "A maximum of 5 attendees are allowed",
      ],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    durationWeeks: {
      type: Number,
      required: [true, "Duration in weeks is required"],
      min: [1, "Duration must be at least 1 week"],
      max: [4, "Duration cannot exceed 4 weeks"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    boothSize: {
      type: String,
      required: [true, "Booth size is required"],
      enum: ["2x2", "4x4"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BoothApplication", boothApplicationSchema);
