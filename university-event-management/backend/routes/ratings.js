const express = require('express');
const router = express.Router();
const EventRating = require('../models/EventRating');
const { protect } = require('../middleware/auth');

// Middleware to check if user can rate events
const canRate = (req, res, next) => {
  const allowedRoles = ['student', 'staff', 'ta', 'professor'];
  if (!allowedRoles.includes(req.user.role.toLowerCase())) {
    return res.status(403).json({
      success: false,
      message: 'Only students, staff, TAs, and professors can rate events'
    });
  }
  next();
};

// Middleware to check if user can view ratings
const canViewRatings = (req, res, next) => {
  const allowedRoles = ['student', 'staff', 'ta', 'professor', 'events_office', 'admin'];
  if (!allowedRoles.includes(req.user.role.toLowerCase())) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view ratings'
    });
  }
  next();
};

// @route   POST /api/ratings
// @desc    Create or update a rating for an event
// @access  Private (Student, Staff, TA, Professor only)
router.post('/', protect, canRate, async (req, res) => {
  try {
    const { eventId, eventType, rating, comment } = req.body;

    // Validation
    if (!eventId || !eventType || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide eventId, eventType, rating, and comment'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty'
      });
    }

    // ✅ FIX: Get userName from multiple possible fields
    const userName = req.user.name || req.user.username || req.user.email || 'Anonymous User';
    
    // Debug log to see what's available
    console.log('User object:', {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    });

    // Check if user already rated this event
    const existingRating = await EventRating.findOne({
      eventId,
      userId: req.user._id
    });

    let savedRating;

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.userName = userName; // Update name too
      existingRating.updatedAt = Date.now();
      savedRating = await existingRating.save();
    } else {
      // Create new rating
      const newRating = new EventRating({
        eventId,
        eventType,
        userId: req.user._id,
        userRole: req.user.role.toLowerCase(),
        userName: userName, // ✅ Use the fallback value
        rating,
        comment
      });
      savedRating = await newRating.save();
    }

    res.status(201).json({
      success: true,
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
      data: savedRating
    });
  } catch (error) {
    console.error('Error creating/updating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
});

// @route   GET /api/ratings/event/:eventId
// @desc    Get all ratings for a specific event
// @access  Private (Student, Staff, TA, Professor, Events Office, Admin)
router.get('/event/:eventId', protect, canViewRatings, async (req, res) => {
  try {
    const { eventId } = req.params;

    const ratings = await EventRating.find({ eventId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate statistics
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    const ratingDistribution = {
      5: ratings.filter(r => r.rating === 5).length,
      4: ratings.filter(r => r.rating === 4).length,
      3: ratings.filter(r => r.rating === 3).length,
      2: ratings.filter(r => r.rating === 2).length,
      1: ratings.filter(r => r.rating === 1).length,
    };

    res.status(200).json({
      success: true,
      data: {
        ratings,
        statistics: {
          totalRatings,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution
        }
      }
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings',
      error: error.message
    });
  }
});

// @route   GET /api/ratings/my-rating/:eventId
// @desc    Get current user's rating for a specific event
// @access  Private (Student, Staff, TA, Professor)
router.get('/my-rating/:eventId', protect, canRate, async (req, res) => {
  try {
    const { eventId } = req.params;

    const rating = await EventRating.findOne({
      eventId,
      userId: req.user._id
    }).lean();

    res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your rating',
      error: error.message
    });
  }
});

// @route   DELETE /api/ratings/:ratingId
// @desc    Delete a rating (only by the user who created it)
// @access  Private (Student, Staff, TA, Professor)
router.delete('/:ratingId', protect, canRate, async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await EventRating.findOne({
      _id: ratingId,
      userId: req.user._id
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found or you do not have permission to delete it'
      });
    }

    await rating.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete rating',
      error: error.message
    });
  }
});

module.exports = router;