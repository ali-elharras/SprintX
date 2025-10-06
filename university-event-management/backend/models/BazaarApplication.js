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

const bazaarApplicationSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    bazaar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    attendees: {
      type: [attendeeSchema],
      validate: [
        (val) => val.length <= 5,
        "A maximum of 5 attendees are allowed",
      ],
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

bazaarApplicationSchema.index({ vendor: 1, bazaar: 1 }, { unique: true });

module.exports = mongoose.model("BazaarApplication", bazaarApplicationSchema);
