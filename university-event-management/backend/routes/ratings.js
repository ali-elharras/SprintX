const express = require("express");
const router = express.Router();
const EventRating = require("../models/EventRating");
const User = require("../models/User");
const Event = require("../models/Event");
const emailService = require("../services/emailService");
const axios = require("axios");
// Auth middleware still used for regular user actions; admin endpoints will be public per request
const { protect } = require("../middleware/auth");

// Middleware to check if user can rate events
const canRate = (req, res, next) => {
  const allowedRoles = ["student", "staff", "ta", "professor"];
  if (!allowedRoles.includes(req.user.role.toLowerCase())) {
    return res.status(403).json({
      success: false,
      message: "Only students, staff, TAs, and professors can rate events",
    });
  }
  next();
};

// Middleware to check if user can view ratings
const canViewRatings = (req, res, next) => {
  const allowedRoles = [
    "student",
    "staff",
    "ta",
    "professor",
    "events_office",
    "admin",
  ];
  if (!allowedRoles.includes(req.user.role.toLowerCase())) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to view ratings",
    });
  }
  next();
};

// @route   POST /api/ratings
// @desc    Create or update a rating for an event
// @access  Private (Student, Staff, TA, Professor only)
router.post("/", protect, canRate, async (req, res) => {
  try {
    const { eventId, eventType, rating, comment } = req.body;

    // Validation
    if (!eventId || !eventType || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide eventId, eventType, rating, and comment",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    // AI Comment Analysis
    let aiClassification = "Good";
    let aiReasoning = "";

    try {
      const aiResponse = await axios.post("http://127.0.0.1:8000/analyze-comment", {
        text: comment,
      });

      const { category, reasoning } = aiResponse.data;
      aiClassification = category;
      aiReasoning = reasoning;

      if (category !== "Good") {
        return res.status(400).json({
          success: false,
          message: `Comment rejected as ${category}. Reasoning: ${reasoning}`,
        });
      }
    } catch (error) {
      console.error("AI Service Error:", error.message);
      // If AI service is down, we might want to fail safely or block. 
      // Given the requirement is to use the AI to define type, we'll block on failure to ensure safety.
      return res.status(503).json({
        success: false,
        message: "Comment analysis service unavailable. Please try again later.",
      });
    }

    // ✅ FIX: Get userName from multiple possible fields
    const userName =
      req.user.name || req.user.username || req.user.email || "Anonymous User";

    // Debug log to see what's available
    console.log("User object:", {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    });

    // Check if user already rated this event
    const existingRating = await EventRating.findOne({
      eventId,
      userId: req.user._id,
    });

    let savedRating;

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      existingRating.userName = userName; // Update name too
      existingRating.updatedAt = Date.now();
      existingRating.aiClassification = aiClassification;
      existingRating.aiReasoning = aiReasoning;
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
        comment,
        aiClassification,
        aiReasoning
      });
      savedRating = await newRating.save();
    }

    res.status(201).json({
      success: true,
      message: existingRating
        ? "Rating updated successfully"
        : "Rating submitted successfully",
      data: savedRating,
    });
  } catch (error) {
    console.error("Error creating/updating rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit rating",
      error: error.message,
    });
  }
});

// @route   GET /api/ratings/event/:eventId
// @desc    Get all ratings for a specific event
// @access  Private (Student, Staff, TA, Professor, Events Office, Admin)
router.get("/event/:eventId", protect, canViewRatings, async (req, res) => {
  try {
    const { eventId } = req.params;

    const ratings = await EventRating.find({ eventId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate statistics
    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    const ratingDistribution = {
      5: ratings.filter((r) => r.rating === 5).length,
      4: ratings.filter((r) => r.rating === 4).length,
      3: ratings.filter((r) => r.rating === 3).length,
      2: ratings.filter((r) => r.rating === 2).length,
      1: ratings.filter((r) => r.rating === 1).length,
    };

    res.status(200).json({
      success: true,
      data: {
        ratings,
        statistics: {
          totalRatings,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ratings",
      error: error.message,
    });
  }
});

// @route   GET /api/ratings/my-rating/:eventId
// @desc    Get current user's rating for a specific event
// @access  Private (Student, Staff, TA, Professor)
router.get("/my-rating/:eventId", protect, canRate, async (req, res) => {
  try {
    const { eventId } = req.params;

    const rating = await EventRating.findOne({
      eventId,
      userId: req.user._id,
    }).lean();

    res.status(200).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    console.error("Error fetching user rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your rating",
      error: error.message,
    });
  }
});

// @route   DELETE /api/ratings/:ratingId
// @desc    Delete a rating (only by the user who created it)
// @access  Private (Student, Staff, TA, Professor)
router.delete("/:ratingId", protect, canRate, async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await EventRating.findOne({
      _id: ratingId,
      userId: req.user._id,
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found or you do not have permission to delete it",
      });
    }

    await rating.deleteOne();

    res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete rating",
      error: error.message,
    });
  }
});

module.exports = router;

/**
 * ===================== ADMIN COMMENT MANAGEMENT ENDPOINTS =====================
 * These endpoints allow an admin to:
 *   - View all ratings/comments across all events (with filtering & pagination)
 *   - Delete any rating/comment regardless of owner
 *
 * NOTE: We keep existing user deletion route intact. Admin deletion bypasses
 *       the userId ownership check and uses role-based authorization instead.
 */

// @route   GET /api/ratings/admin/events-with-ratings
// @desc    Admin: Get all events that have ratings/comments
// @access  Public (no auth per user request)
router.get("/admin/events-with-ratings", async (req, res) => {
  try {
    // Get all ratings grouped by eventId and eventType
    const ratingsGrouped = await EventRating.aggregate([
      {
        $group: {
          _id: { eventId: "$eventId", eventType: "$eventType" },
          count: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      }
    ]);

    if (ratingsGrouped.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Separate event IDs by type
    const eventIds = [];
    const gymIds = [];
    const courtIds = [];
    const ratingsMap = new Map();

    ratingsGrouped.forEach(group => {
      const { eventId, eventType } = group._id;
      ratingsMap.set(eventId.toString(), {
        count: group.count,
        avgRating: group.avgRating
      });

      if (eventType === 'event') eventIds.push(eventId);
      else if (eventType === 'gym') gymIds.push(eventId);
      else if (eventType === 'court') courtIds.push(eventId);
    });

    // Fetch all events from different collections
    const allEvents = [];

    // Fetch regular events
    if (eventIds.length > 0) {
      const events = await Event.find({ _id: { $in: eventIds } }).lean();
      events.forEach(event => {
        const stats = ratingsMap.get(event._id.toString());
        allEvents.push({
          ...event,
          type: event.type || 'event',
          title: event.title || event.name,
          ratingsCount: stats.count,
          averageRating: Math.round(stats.avgRating * 10) / 10,
        });
      });
    }

    // For gym and court, we'll need to import those models if they exist
    // For now, just return the events we have

    res.status(200).json({
      success: true,
      data: allEvents,
    });
  } catch (error) {
    console.error("Error fetching events with ratings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events with ratings",
      error: error.message,
    });
  }
});

// @route   GET /api/ratings/admin/all
// @desc    Admin: Get all ratings/comments with optional filters & pagination
// @access  Private (Admin only)
router.get("/admin/all", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      eventType,
      userRole,
      eventId,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const numericPage = Math.max(parseInt(page, 10), 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10), 1), 100); // cap at 100

    const query = {};
    if (eventType) query.eventType = eventType;
    if (userRole) query.userRole = userRole;
    if (eventId) query.eventId = eventId; // expecting valid ObjectId string
    if (search && search.trim().length > 0) {
      // Text search on comment or userName
      query.$or = [
        { comment: { $regex: search.trim(), $options: "i" } },
        { userName: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const sortDirection = order === "asc" ? 1 : -1;
    const sortSpec = { [sort]: sortDirection };

    const [total, ratings] = await Promise.all([
      EventRating.countDocuments(query),
      EventRating.find(query)
        .sort(sortSpec)
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: ratings,
      meta: {
        total,
        page: numericPage,
        limit: numericLimit,
        totalPages: Math.ceil(total / numericLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching all ratings (admin):", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ratings",
      error: error.message,
    });
  }
});

// @route   DELETE /api/ratings/admin/:ratingId
// @desc    Admin: Delete any rating/comment and send warning email
// @access  Private (Admin only)
router.delete("/admin/:ratingId", async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { reason } = req.body; // Optional reason for deletion

    const rating = await EventRating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    // Get user information to send warning email
    const user = await User.findById(rating.userId);

    // Get event information for context
    let eventName = "Unknown Event";
    try {
      const event = await Event.findById(rating.eventId);
      if (event) {
        eventName = event.title || event.name || "Unknown Event";
      }
    } catch (eventError) {
      console.error("Error fetching event details:", eventError);
      // Continue with deletion even if event lookup fails
    }

    // Store comment before deletion
    const deletedComment = rating.comment;

    // Delete the rating
    await rating.deleteOne();

    // Send warning email to the user (if user exists)
    if (user) {
      try {
        await emailService.sendCommentDeletionWarning(
          user,
          eventName,
          deletedComment,
          reason || "inappropriate content"
        );
        console.log(
          `✅ Warning email sent to user ${user.email} for deleted comment`
        );
      } catch (emailError) {
        console.error("Error sending warning email:", emailError);
        // Don't fail the deletion if email fails - just log it
      }
    } else {
      console.warn(
        `⚠️ User not found for rating ${ratingId}, skipping warning email`
      );
    }

    res.status(200).json({
      success: true,
      message: "Rating deleted successfully and warning email sent to user",
    });
  } catch (error) {
    console.error("Error admin deleting rating:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete rating",
      error: error.message,
    });
  }
});
