const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const websiteRatingController = require('../controllers/websiteRatingController');

// User routes (all authenticated users can rate)
router.post('/', protect, websiteRatingController.submitRating);
router.get('/my-rating', protect, websiteRatingController.getMyRating);

// Admin routes (only admins can view all ratings and stats)
router.get('/all', protect, authorize('admin'), websiteRatingController.getAllRatings);
router.get('/stats', protect, authorize('admin'), websiteRatingController.getRatingStats);
router.delete('/:id', protect, authorize('admin'), websiteRatingController.deleteRating);

module.exports = router;
