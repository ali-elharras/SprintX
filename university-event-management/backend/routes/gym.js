const express = require("express");
const {
  getGymSessions,
  getGymSessionsByMonth,
  getGymSessionsByDate,
  getGymSession,
  getGymSessionTypes,
  registerForGymSession,
  getUserGymRegistrations,
  cancelGymRegistration,
  getGymScheduleOverview,
} = require("../controllers/gymController");

const { protect } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/sessions", getGymSessions);
router.get("/sessions/month/:year/:month", getGymSessionsByMonth);
router.get("/sessions/date/:date", getGymSessionsByDate);
router.get("/sessions/:id", getGymSession);
router.get("/types", getGymSessionTypes);
router.get("/schedule/overview", getGymScheduleOverview);

// Protected routes (require authentication)
router.use(protect);

// User registration routes
router.post("/sessions/:id/register", registerForGymSession);
router.get("/registrations", getUserGymRegistrations);
router.delete("/registrations/:id", cancelGymRegistration);

module.exports = router;