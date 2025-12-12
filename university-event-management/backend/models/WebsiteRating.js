const mongoose = require('mongoose');

const websiteRatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    enum: ['student', 'staff', 'ta', 'professor', 'admin'],
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
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
  category: {
    type: String,
    enum: ['usability', 'design', 'performance', 'features', 'overall'],
    required: true
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

// Index for efficient queries
websiteRatingSchema.index({ userId: 1 });
websiteRatingSchema.index({ rating: 1 });
websiteRatingSchema.index({ category: 1 });
websiteRatingSchema.index({ createdAt: -1 });

// Only one rating per user
websiteRatingSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('WebsiteRating', websiteRatingSchema);
