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
router.get("/", getCourts);
router.get("/stats", getCourtStats);
router.get("/type/:type", getCourtsByType);
router.get("/:id", getCourt);
router.get("/:id/availability/:date", getCourtAvailability);
router.get("/:id/weekly-availability", getWeeklyAvailability);

// Protected routes (require authentication)
router.use(protect);

// Admin only routes for court management
router.post("/", authorize("admin"), createCourtValidation, createCourt);
router.put("/:id", authorize("admin"), updateCourtValidation, updateCourt);
router.delete("/:id", authorize("admin"), deleteCourt);

module.exports = router;