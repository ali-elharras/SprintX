const express = require("express");
const { body } = require("express-validator");
const {
  getCourts,
  getCourt,
  getCourtsByType,
  getCourtAvailability,
  getWeeklyAvailability,
  createCourt,
  updateCourt,
  deleteCourt,
  getCourtStats,
  reserveCourt,
  getUserReservations,
  getCourtReservations,
  getAvailableSlots,
  cancelReservation,
} = require("../controllers/courtController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation rules for court creation
const createCourtValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Court name is required and must be between 1 and 100 characters"),
  body("type")
    .isIn(["basketball", "tennis", "football"])
    .withMessage("Invalid court type. Must be basketball, tennis, or football"),
  body("location")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Location is required and must be between 1 and 200 characters"),
  body("capacity")
    .isInt({ min: 1, max: 100 })
    .withMessage("Capacity must be between 1 and 100"),
  body("surface")
    .isIn(["grass", "hardcourt", "clay", "artificial_turf", "indoor_court"])
    .withMessage("Invalid surface type"),
  body("pricing.hourlyRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Hourly rate cannot be negative"),
  body("pricing.studentDiscount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Student discount must be between 0 and 100"),
  body("pricing.staffDiscount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Staff discount must be between 0 and 100"),
  body("slotDuration")
    .optional()
    .isInt({ min: 30, max: 240 })
    .withMessage("Slot duration must be between 30 and 240 minutes"),
  body("manager")
    .optional()
    .isMongoId()
    .withMessage("Invalid manager ID"),
];

// Validation rules for court update
const updateCourtValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Court name must be between 1 and 100 characters"),
  body("type")
    .optional()
    .isIn(["basketball", "tennis", "football"])
    .withMessage("Invalid court type"),
  body("location")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Location must be between 1 and 200 characters"),
  body("capacity")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Capacity must be between 1 and 100"),
  body("surface")
    .optional()
    .isIn(["grass", "hardcourt", "clay", "artificial_turf", "indoor_court"])
    .withMessage("Invalid surface type"),
  body("status")
    .optional()
    .isIn(["active", "maintenance", "closed", "under_construction"])
    .withMessage("Invalid status"),
];

// Public routes - accessible to all users (including non-authenticated)
router.get("/stats", getCourtStats);
router.get("/type/:type", getCourtsByType);

// Protected routes (require authentication)
router.use(protect);

// User's own reservations (all authenticated users) - MUST come before /:id routes
router.get("/my-reservations", getUserReservations);
router.delete("/my-reservations/:id", cancelReservation);

// Public court routes with :id parameter (must come after specific routes like /my-reservations)
router.get("/:id/availability/:date", getCourtAvailability);
router.get("/:id/weekly-availability", getWeeklyAvailability);
router.get("/:id/available-slots/:date", getAvailableSlots);
router.get("/:id/reservations", authorize("admin", "events_office"), getCourtReservations);
router.get("/:id", getCourt);
router.get("/", getCourts);

// Court reservation routes (students, staff, TA, professors)
router.post("/:id/reserve", 
  authorize("student", "staff", "ta", "professor"),
  [
    body("date")
      .notEmpty()
      .withMessage("Date is required")
      .isISO8601()
      .withMessage("Invalid date format"),
    body("startTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("Start time must be in HH:MM format"),
    body("endTime")
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage("End time must be in HH:MM format"),
    body("purpose")
      .optional()
      .isIn(["practice", "match", "training", "event", "other"])
      .withMessage("Invalid purpose"),
    body("numberOfParticipants")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Number of participants must be at least 1"),
  ],
  reserveCourt
);

// Admin only routes for court management
router.post("/", authorize("admin"), createCourtValidation, createCourt);
router.put("/:id", authorize("admin"), updateCourtValidation, updateCourt);
router.delete("/:id", authorize("admin"), deleteCourt);

module.exports = router;