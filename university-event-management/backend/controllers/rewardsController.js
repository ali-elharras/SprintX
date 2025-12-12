const User = require("../models/User");

// @desc    Get user's reward points info
// @route   GET /api/rewards/me
// @access  Private
const getMyRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "rewardPoints lastDailyReward consecutiveDays"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate next reward info
    const now = new Date();
    const lastReward = user.lastDailyReward;
    let canClaimToday = true;
    let nextRewardIn = null;

    if (lastReward) {
      const lastRewardDate = new Date(lastReward);
      lastRewardDate.setHours(0, 0, 0, 0);
      const todayDate = new Date(now);
      todayDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (todayDate - lastRewardDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        canClaimToday = false;
        const tomorrow = new Date(todayDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        nextRewardIn = tomorrow.getTime() - now.getTime();
      }
    }

    // Calculate next reward amount
    const nextRewardAmount =
      user.consecutiveDays === 0
        ? 10
        : Math.min(10 + user.consecutiveDays * 2, 30);

    res.status(200).json({
      success: true,
      data: {
        rewardPoints: user.rewardPoints,
        consecutiveDays: user.consecutiveDays,
        lastDailyReward: user.lastDailyReward,
        canClaimToday,
        nextRewardIn,
        nextRewardAmount,
        pointsToMoneyRatio: "10 points = 1 EGP discount",
        maxDiscountPercent: 50,
      },
    });
  } catch (error) {
    console.error("Error getting rewards:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reward points",
      error: error.message,
    });
  }
};

// @desc    Calculate discount for using points
// @route   POST /api/rewards/calculate-discount
// @access  Private
const calculateDiscount = async (req, res) => {
  try {
    const { eventCost, pointsToUse } = req.body;

    if (!eventCost || eventCost <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid event cost is required",
      });
    }

    if (!pointsToUse || pointsToUse <= 0) {
      return res.status(400).json({
        success: false,
        message: "Points to use must be greater than 0",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Validate user has enough points
    if (pointsToUse > user.rewardPoints) {
      return res.status(400).json({
        success: false,
        message: `Insufficient points. You have ${user.rewardPoints} points available.`,
        availablePoints: user.rewardPoints,
      });
    }

    // Calculate discount (10 points = 1 EGP)
    const pointsValue = pointsToUse / 10;
    const maxDiscount = eventCost * 0.5; // Max 50% discount
    const discount = Math.min(pointsValue, maxDiscount);
    const finalCost = Math.max(0, eventCost - discount);
    const actualPointsUsed = Math.floor(discount * 10);

    res.status(200).json({
      success: true,
      data: {
        originalCost: eventCost,
        pointsRequested: pointsToUse,
        pointsUsed: actualPointsUsed,
        discount: discount,
        finalCost: finalCost,
        pointsRemaining: user.rewardPoints - actualPointsUsed,
      },
    });
  } catch (error) {
    console.error("Error calculating discount:", error);
    res.status(500).json({
      success: false,
      message: "Error calculating discount",
      error: error.message,
    });
  }
};

// @desc    Get reward history/leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topUsers = await User.find({
      role: { $in: ["student", "staff", "ta", "professor"] },
    })
      .select("firstName lastName rewardPoints consecutiveDays")
      .sort({ rewardPoints: -1 })
      .limit(parseInt(limit));

    // Find current user's rank
    const currentUser = await User.findById(req.user.id).select(
      "firstName lastName rewardPoints consecutiveDays"
    );

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userRank =
      (await User.countDocuments({
        role: { $in: ["student", "staff", "ta", "professor"] },
        rewardPoints: { $gt: currentUser.rewardPoints },
      })) + 1;

    res.status(200).json({
      success: true,
      data: {
        leaderboard: topUsers.map((user, index) => ({
          rank: index + 1,
          name: `${user.firstName} ${user.lastName}`,
          points: user.rewardPoints,
          streak: user.consecutiveDays,
        })),
        currentUser: {
          rank: userRank,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          points: currentUser.rewardPoints,
          streak: currentUser.consecutiveDays,
        },
      },
    });
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
      error: error.message,
    });
  }
};

module.exports = {
  getMyRewards,
  calculateDiscount,
  getLeaderboard,
};
