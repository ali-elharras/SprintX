const express = require("express");
const { body } = require("express-validator");
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByType,
  getUpcomingBazaars,
  seedBazaar,
  toggleArchiveStatus,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// =============================
// Validation Rules for Creation
// =============================
const createEventValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Name is required and must be between 1 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Description is required and must be between 1 and 2000 characters"),
  body("type")
    .isIn(["workshop", "trip", "bazaar", "booth", "conference"])
    .withMessage("Invalid event type"),
  body("startDate")
    .isISO8601()
    .withMessage("Invalid start date")
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error("Start date cannot be in the past");
      }
      return true;
    }),
  body("endDate")
    .isISO8601()
    .withMessage("Invalid end date")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("location")
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage("Location is required and must be between 1 and 300 characters"),
  body("registrationDeadline")
    .optional()
    .isISO8601()
    .withMessage("Invalid registration deadline")
    .custom((value, { req }) => {
      if (value && new Date(value) >= new Date(req.body.startDate)) {
        throw new Error("Registration deadline must be before start date");
      }
      return true;
    }),
  body("maxParticipants")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Maximum participants must be at least 1"),
  body("eligibleRoles")
    .optional()
    .isArray()
    .withMessage("Eligible roles must be an array")
    .custom((value) => {
      const validRoles = ["student", "staff", "ta", "professor"];
      const isValid = value.every((role) => validRoles.includes(role));
      if (!isValid) {
        throw new Error("Invalid role in eligible roles");
      }
      return true;
    }),
  body("cost")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Cost cannot be negative"),
];

// =============================
// Public Routes
// =============================
router.get("/", getEvents);
router.get("/type/:type", getEventsByType);
router.get("/:id", getEvent);

// =============================
// Protected & Admin Routes
// =============================
router.use(protect);

// Admin or Events Office
router.post(
  "/",
  authorize("admin", "events_office"),
  createEventValidation,
  createEvent
);
router.put(
  "/:id",
  authorize("admin", "events_office"),
  updateEvent
);
// Update only status (publish/reject) - Admin or Events Office
router.put("/:id/status", authorize("admin", "events_office"), (req, res, next) => {
  // delegate to controller
  return require("../controllers/eventController").updateEventStatus(req, res, next);
});
router.delete(
  "/:id",
  authorize("admin", "events_office"),
  deleteEvent
);
router.patch(
  "/:id/archive",
  authorize("admin", "events_office"),
  toggleArchiveStatus
);


// =============================
// Bazaar Routes
// =============================
router.get("/bazaars/upcoming", getUpcomingBazaars);


module.exports = router;