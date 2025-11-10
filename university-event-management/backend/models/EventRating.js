const mongoose = require('mongoose');

const eventRatingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    enum: ['event', 'gym', 'court'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['student', 'staff', 'ta', 'professor'],
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one rating per user per event
eventRatingSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Index for efficient queries
eventRatingSchema.index({ eventId: 1, createdAt: -1 });

module.exports = mongoose.model('EventRating', eventRatingSchema);