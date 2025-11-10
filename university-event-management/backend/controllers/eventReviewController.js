const EventReview = require('../models/EventReview');const EventReview = require('../models/EventReview');

const Event = require('../models/Event');const Registration = require('../models/Registration');

const User = require('../models/User');

// Create a new review

exports.createReview = async (req, res) => {// Helper: Check if user attended the event

    try {async function userAttendedEvent(eventId, userId) {

        const { rating, comment } = req.body;  // Check Registration for event and user

        const { eventId } = req.params;  const reg = await Registration.findOne({ event: eventId, user: userId, status: 'attended' });

        const userId = req.user._id;  return !!reg;

}

        // Check if event exists

        const event = await Event.findById(eventId);// POST /api/events/:eventId/reviews

        if (!event) {exports.createReview = async (req, res) => {

            return res.status(404).json({  const { eventId } = req.params;

                success: false,  const { rating, comment } = req.body;

                message: 'Event not found'  const userId = req.user._id;

            });  const allowedRoles = ['Student', 'Staff', 'TA', 'Professor'];

        }

  // Only eligible roles

        // Check if user has already reviewed this event  if (!allowedRoles.includes(req.user.role)) {

        const existingReview = await EventReview.findOne({ event: eventId, user: userId });    return res.status(403).json({ message: 'Not authorized to review events.' });

        if (existingReview) {  }

            return res.status(400).json({

                success: false,  // Must have attended

                message: 'You have already reviewed this event'  const attended = await userAttendedEvent(eventId, userId);

            });  if (!attended) {

        }    return res.status(403).json({ message: 'You can only review events you attended.' });

  }

        // Create new review

        const review = await EventReview.create({  try {

            event: eventId,    const review = new EventReview({ event: eventId, user: userId, rating, comment });

            user: userId,    await review.save();

            rating,    res.status(201).json({ message: 'Review submitted.', review });

            comment  } catch (err) {

        });    if (err.code === 11000) {

      return res.status(400).json({ message: 'You have already reviewed this event.' });

        // Populate user details    }

        await review.populate('user', 'name email');    res.status(500).json({ message: 'Error submitting review.', error: err });

  }

        res.status(201).json({};

            success: true,

            data: review,// GET /api/events/:eventId/reviews

            message: 'Review submitted successfully'exports.getReviews = async (req, res) => {

        });  const { eventId } = req.params;

  // Allowed roles for viewing

    } catch (error) {  const allowedRoles = ['Student', 'Staff', 'Events Office', 'TA', 'Professor', 'Admin'];

        console.error('Error in createReview:', error);  if (!allowedRoles.includes(req.user.role)) {

        res.status(500).json({    return res.status(403).json({ message: 'Not authorized to view reviews.' });

            success: false,  }

            message: error.message || 'Error submitting review'  try {

        });    const reviews = await EventReview.find({ event: eventId }).populate('user', 'name role');

    }    res.json({ reviews });

};  } catch (err) {

    res.status(500).json({ message: 'Error fetching reviews.', error: err });

// Get all reviews for an event  }

exports.getReviews = async (req, res) => {};

    try {
        const { eventId } = req.params;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Get reviews with user details
        const reviews = await EventReview.find({ event: eventId })
            .populate('user', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            data: reviews
        });

    } catch (error) {
        console.error('Error in getReviews:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching reviews'
        });
    }
};