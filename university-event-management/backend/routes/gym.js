const express = require("express");
const {
  getGymSessions,
  getGymSessionsByMonth,
  getGymSessionsByDate,
  getGymSession,
  getGymSessionTypes,
  createGymSession,
  registerForGymSession,
  getUserGymRegistrations,
  cancelGymRegistration,
  getGymScheduleOverview,
  updateGymSession,
} = require("../controllers/gymController");

const { protect } = require("../middleware/auth");
const { requireAdminOrEventsOffice } = require("../middleware/auth");

const { check } = require('express-validator');
const router = express.Router();

// Public routes
router.get("/sessions", getGymSessions);
// Create session (admin/events office)
router.post(
  "/sessions",
  protect,
  requireAdminOrEventsOffice,
  [
    check('title').notEmpty().withMessage('Title is required'),
    check('type').notEmpty().withMessage('Type is required'),
    check('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be an integer between 0 and 6'),
    check('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
    check('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
    check('duration').isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
    check('startDate').notEmpty().withMessage('Start date is required').isISO8601().toDate(),
    check('endDate').notEmpty().withMessage('End date is required').isISO8601().toDate(),
    check('location').notEmpty().withMessage('Location is required'),
    check('maxParticipants').isInt({ min: 1, max: 100 }).withMessage('maxParticipants must be between 1 and 100'),
  ],
  createGymSession
);
// Update session (admin/events office)
router.put(
  "/sessions/:id",
  protect,
  requireAdminOrEventsOffice,
  [
    check('title').optional().notEmpty().withMessage('Title is required'),
    check('type').optional().notEmpty().withMessage('Type is required'),
    check('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Day of week must be an integer between 0 and 6'),
    check('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
    check('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
    check('duration').optional().isInt({ min: 15, max: 180 }).withMessage('Duration must be between 15 and 180 minutes'),
    check('startDate').optional().isISO8601().toDate(),
    check('endDate').optional().isISO8601().toDate(),
    check('location').optional().notEmpty().withMessage('Location is required'),
    check('maxParticipants').optional().isInt({ min: 1, max: 100 }).withMessage('maxParticipants must be between 1 and 100'),
  ],
  updateGymSession
);
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