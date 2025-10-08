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
    duration: {
      type: String,
      required: [true, "Duration is required"],
      enum: ["1 week", "2 weeks", "3 weeks", "4 weeks"],
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
