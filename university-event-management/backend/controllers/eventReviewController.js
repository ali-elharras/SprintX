const EventReview = require('../models/EventReview');
const Registration = require('../models/Registration');
const User = require('../models/User');

// Helper: Check if user attended the event
async function userAttendedEvent(eventId, userId) {
  // Check Registration for event and user
  const reg = await Registration.findOne({ event: eventId, user: userId, status: 'attended' });
  return !!reg;
}

// POST /api/events/:eventId/reviews
exports.createReview = async (req, res) => {
  const { eventId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user._id;
  const allowedRoles = ['Student', 'Staff', 'TA', 'Professor'];

  // Only eligible roles
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to review events.' });
  }

  // Must have attended
  const attended = await userAttendedEvent(eventId, userId);
  if (!attended) {
    return res.status(403).json({ message: 'You can only review events you attended.' });
  }

  try {
    const review = new EventReview({ event: eventId, user: userId, rating, comment });
    await review.save();
    res.status(201).json({ message: 'Review submitted.', review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this event.' });
    }
    res.status(500).json({ message: 'Error submitting review.', error: err });
  }
};

// GET /api/events/:eventId/reviews
exports.getReviews = async (req, res) => {
  const { eventId } = req.params;
  // Allowed roles for viewing
  const allowedRoles = ['Student', 'Staff', 'Events Office', 'TA', 'Professor', 'Admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized to view reviews.' });
  }
  try {
    const reviews = await EventReview.find({ event: eventId }).populate('user', 'name role');
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reviews.', error: err });
  }
};
