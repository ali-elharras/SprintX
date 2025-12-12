const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getMyRewards,
  calculateDiscount,
  getLeaderboard,
} = require("../controllers/rewardsController");

// All reward routes require authentication
router.use(protect);

// @route   GET /api/rewards/me
router.get("/me", getMyRewards);

// @route   POST /api/rewards/calculate-discount
router.post("/calculate-discount", calculateDiscount);

// @route   GET /api/rewards/leaderboard
router.get("/leaderboard", getLeaderboard);

module.exports = router;
