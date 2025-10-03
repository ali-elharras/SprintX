const express = require("express");
const { body } = require("express-validator");
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByType,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation rules for event creation
const createEventValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title is required and must be between 1 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Description is required and must be between 1 and 2000 characters"),
  body("type")
    .isIn(["workshop", "trip", "bazaar", "competition", "conference"])
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
      const isValid = value.every(role => validRoles.includes(role));
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

// Public routes
router.get("/", getEvents);
router.get("/type/:type", getEventsByType);
router.get("/:id", getEvent);

// Protected routes (require authentication)
router.use(protect);

// Admin/Events Office only routes
router.post("/", authorize("admin", "events_office"), createEventValidation, createEvent);
router.put("/:id", authorize("admin", "events_office"), updateEvent);
router.delete("/:id", authorize("admin", "events_office"), deleteEvent);

module.exports = router;