const EventReview = require('../models/EventReview');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');

// ✅ Helper to check event attendance
async function userAttendedEvent(eventId, userId) {
    const reg = await Registration.findOne({
        event: eventId,
        user: userId,
        status: 'attended'
    });
    return !!reg;
}

// ✅ Create Review
exports.createReview = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;
        const allowedRoles = ['Student', 'Staff', 'TA', 'Professor'];

        // ✅ Only some roles can review
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to review events.' });
        }

        // ✅ Check event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // ✅ Check if already reviewed
        const existingReview = await EventReview.findOne({ event: eventId, user: userId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this event'
            });
        }

        // ✅ Must have attended
        const attended = await userAttendedEvent(eventId, userId);
        if (!attended) {
            return res.status(403).json({ message: 'You can only review events you attended.' });
        }

        // ✅ Create review
        const review = await EventReview.create({
            event: eventId,
            user: userId,
            rating,
            comment
        });

        await review.populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            data: review
        });

    } catch (error) {
        console.error('Error in createReview:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error submitting review'
        });
    }
};

// ✅ Get reviews for event
exports.getReviews = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const reviews = await EventReview.find({ event: eventId })
            .populate('user', 'name role')
            .sort('-createdAt');

        res.json({ success: true, data: reviews });

    } catch (err) {
        res.status(500).json({ message: 'Error fetching reviews.', error: err });
    }
};
