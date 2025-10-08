const express = require("express");
const { body } = require("express-validator");
const {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  cancelRegistration,
  updateRegistrationStatus,
  checkInParticipant,
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Optional authentication middleware - tries to authenticate but doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (token) {
      const jwt = require("jsonwebtoken");
      const User = require("../models/User");
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // If authentication fails, continue without user
    next();
  }
};

// Validation rules for registration
const registrationValidation = [
  body("eventId")
    .isMongoId()
    .withMessage("Invalid event ID"),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be between 1 and 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required and must be between 1 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("universityId")
    .trim()
    .matches(/^[A-Za-z0-9\-]+$/)
    .isLength({ min: 1, max: 20 })
    .withMessage("University/Staff ID is required and can only contain letters, numbers, and dashes"),
  body("role")
    .isIn(["student", "staff", "ta", "professor"])
    .withMessage("Invalid role"),
  body("department")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Department name cannot exceed 100 characters"),
  body("phoneNumber")
    .optional()
    .matches(/^[\+]?[\d\s\-\(\)]{10,}$/)
    .withMessage("Invalid phone number format"),
  body("yearOfStudy")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Year of study must be between 1 and 10")
    .custom((value, { req }) => {
      if (req.body.role === "student" && !value) {
        throw new Error("Year of study is required for students");
      }
      return true;
    }),
  body("specialRequirements")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Special requirements cannot exceed 500 characters"),
  body("dietaryRestrictions")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Dietary restrictions cannot exceed 300 characters"),
  body("emergencyContact.name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Emergency contact name cannot exceed 100 characters"),
  body("emergencyContact.phone")
    .optional()
    .matches(/^[\+]?[\d\s\-\(\)]{10,}$/)
    .withMessage("Invalid emergency contact phone number format"),
  body("emergencyContact.relationship")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Relationship cannot exceed 50 characters"),
];

// Registration route with optional authentication
router.post("/", optionalAuth, registrationValidation, registerForEvent);

// Protected routes (require authentication)
router.use(protect);

// User routes
router.get("/my", getMyRegistrations);
router.delete("/:id", cancelRegistration);

// Admin/Events Office/Organizer routes
router.get("/event/:eventId", authorize("admin", "events_office"), getEventRegistrations);
router.put("/:id/status", authorize("admin", "events_office"), updateRegistrationStatus);
router.post("/:id/checkin", authorize("admin", "events_office"), checkInParticipant);

module.exports = router;