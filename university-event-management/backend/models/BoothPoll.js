const mongoose = require('mongoose');

const pollVendorOptionSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: false,
  },
  companyName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  votes: {
    type: Number,
    default: 0,
  },
});

const boothPollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Poll title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Poll description is required'],
      trim: true,
    },
    // Booth details that vendors will be requested to set up
    location: {
      type: String,
      required: [true, 'Location is required'],
      enum: ['GUC Cairo', 'GUC Berlin'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    durationWeeks: {
      type: Number,
      required: [true, 'Duration in weeks is required'],
      min: [1, 'Duration must be at least 1 week'],
      max: [4, 'Duration cannot exceed 4 weeks'],
    },
    boothSize: {
      type: String,
      required: [true, 'Booth size is required'],
      enum: ['2x2', '4x4'],
    },
    // Poll status
    status: {
      type: String,
      enum: ['active', 'closed', 'archived'],
      default: 'active',
    },
    // Vendor options to vote on
    vendors: {
      type: [pollVendorOptionSchema],
      required: [true, 'At least one vendor option is required'],
      validate: [
        (val) => val.length > 0,
        'At least one vendor option is required',
      ],
    },
    // Track votes: user ID -> vendor ID that they voted for
    votes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        vendorIndex: {
          type: Number,
          required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Winner info (set when poll is closed)
    winner: {
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
      },
      vendorIndex: Number,
      companyName: String,
      voteCount: Number,
      declaredAt: Date,
    },
    // Who created the poll
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Poll timing
    pollStartDate: {
      type: Date,
      default: Date.now,
    },
    pollEndDate: {
      type: Date,
      required: [true, 'Poll end date is required'],
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BoothPoll', boothPollSchema);
