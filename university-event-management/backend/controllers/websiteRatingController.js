const WebsiteRating = require('../models/WebsiteRating');
const User = require('../models/User');

/**
 * Submit or update a website rating
 * @route POST /api/website-ratings
 * @access Private (all authenticated users)
 */
exports.submitRating = async (req, res) => {
  try {
    const { rating, comment, category } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!rating || !comment || !category) {
      return res.status(400).json({
        success: false,
        message: 'Rating, comment, and category are required'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already submitted a rating
    let websiteRating = await WebsiteRating.findOne({ userId });

    if (websiteRating) {
      // Update existing rating
      websiteRating.rating = rating;
      websiteRating.comment = comment;
      websiteRating.category = category;
      websiteRating.updatedAt = Date.now();
      await websiteRating.save();

      return res.status(200).json({
        success: true,
        message: 'Website rating updated successfully',
        data: websiteRating
      });
    } else {
      // Create new rating
      websiteRating = await WebsiteRating.create({
        userId,
        userRole: user.role,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        rating,
        comment,
        category
      });

      return res.status(201).json({
        success: true,
        message: 'Website rating submitted successfully',
        data: websiteRating
      });
    }
  } catch (error) {
    console.error('Error submitting website rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
};

/**
 * Get user's own website rating
 * @route GET /api/website-ratings/my-rating
 * @access Private (all authenticated users)
 */
exports.getMyRating = async (req, res) => {
  try {
    const userId = req.user._id;

    const rating = await WebsiteRating.findOne({ userId });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'No rating found'
      });
    }

    return res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rating',
      error: error.message
    });
  }
};

/**
 * Get all website ratings (Admin only)
 * @route GET /api/website-ratings/all
 * @access Private (Admin only)
 */
exports.getAllRatings = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, minRating, maxRating, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (minRating) filter.rating = { ...filter.rating, $gte: parseInt(minRating) };
    if (maxRating) filter.rating = { ...filter.rating, $lte: parseInt(maxRating) };

    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [ratings, total] = await Promise.all([
      WebsiteRating.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      WebsiteRating.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: ratings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all ratings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings',
      error: error.message
    });
  }
};

/**
 * Get website rating statistics (Admin only)
 * @route GET /api/website-ratings/stats
 * @access Private (Admin only)
 */
exports.getRatingStats = async (req, res) => {
  try {
    const stats = await WebsiteRating.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          fiveStars: {
            $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] }
          },
          fourStars: {
            $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] }
          },
          threeStars: {
            $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] }
          },
          twoStars: {
            $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] }
          },
          oneStar: {
            $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] }
          }
        }
      }
    ]);

    // Get ratings by category
    const categoryStats = await WebsiteRating.aggregate([
      {
        $group: {
          _id: '$category',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get ratings by user role
    const roleStats = await WebsiteRating.aggregate([
      {
        $group: {
          _id: '$userRole',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {
          averageRating: 0,
          totalRatings: 0,
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0
        },
        byCategory: categoryStats,
        byRole: roleStats
      }
    });
  } catch (error) {
    console.error('Error fetching rating stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * Delete a website rating (Admin only)
 * @route DELETE /api/website-ratings/:id
 * @access Private (Admin only)
 */
exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;

    const rating = await WebsiteRating.findByIdAndDelete(id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete rating',
      error: error.message
    });
  }
};
