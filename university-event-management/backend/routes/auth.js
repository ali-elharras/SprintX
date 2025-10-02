const express = require("express");
const { body } = require("express-validator");
const {
  registerUser,
  registerVendor,
  login,
  logout,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Validation rules for user registration
const userRegistrationValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required and must be less than 50 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required and must be less than 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .matches(/^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor)\.[a-zA-Z0-9.-]+$/)
    .withMessage(
      "Email must use a valid university domain (@student, @staff, @ta, or @professor)"
    ),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("role")
    .isIn(["student", "staff", "ta", "professor"])
    .withMessage("Role must be one of: student, staff, ta, professor"),
  body("universityId")
    .trim()
    .isLength({ min: 1 })
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage(
      "University ID is required and can only contain letters and numbers"
    ),
  body("department")
    .if(body("role").isIn(["student", "staff", "ta", "professor"]))
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Department is required for students, staff, TAs, and professors"
    ),
  body("yearOfStudy")
    .if(body("role").equals("student"))
    .isInt({ min: 1, max: 10 })
    .withMessage(
      "Year of study is required for students and must be between 1 and 10"
    ),
  body("phoneNumber")
    .optional()
    .matches(/^[\+]?[\d\s\-\(\)]{10,}$/)
    .withMessage("Please provide a valid phone number"),
];

// Validation rules for vendor registration
const vendorRegistrationValidation = [
  body("companyName")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(
      "Company name is required and must be less than 100 characters"
    ),
  body("contactPersonFirstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "Contact person first name is required and must be less than 50 characters"
    ),
  body("contactPersonLastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "Contact person last name is required and must be less than 50 characters"
    ),
  body("email")
    .isEmail()
    .normalizeEmail()
    .custom((email) => {
      // Vendor emails should NOT have university domains
      const universityPattern =
        /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor)\.[a-zA-Z0-9.-]+$/;
      if (universityPattern.test(email)) {
        throw new Error(
          "Vendor registration requires a company email address, not a university domain"
        );
      }
      return true;
    })
    .withMessage("Please provide a valid company email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("businessRegistrationNumber")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Business registration number is required"),
  body("industry")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Industry is required and must be less than 100 characters"),
  body("companySize")
    .isIn(["startup", "small", "medium", "large", "enterprise"])
    .withMessage(
      "Company size must be one of: startup, small, medium, large, enterprise"
    ),
  body("phoneNumber")
    .matches(/^[\+]?[\d\s\-\(\)]{10,}$/)
    .withMessage("Please provide a valid phone number"),
  body("website")
    .optional()
    .isURL()
    .withMessage("Please provide a valid website URL"),
  body("address.street")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage(
      "Street address is required and must be less than 200 characters"
    ),
  body("address.city")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("City is required and must be less than 50 characters"),
  body("address.state")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("State is required and must be less than 50 characters"),
  body("address.zipCode")
    .trim()
    .matches(/^[\d\-\s]{5,10}$/)
    .withMessage("Please provide a valid zip code"),
  body("address.country")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Country is required and must be less than 50 characters"),
  body("description")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage(
      "Company description is required and must be less than 1000 characters"
    ),
  body("interestedEventTypes")
    .isArray({ min: 1 })
    .withMessage("At least one interested event type is required")
    .custom((value) => {
      const validTypes = ["bazaar", "career_fair", "conference", "workshop"];
      return value.every((type) => validTypes.includes(type));
    })
    .withMessage(
      "Interested event types must be from: bazaar, career_fair, conference, workshop"
    ),
];

// Validation rules for login
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").isLength({ min: 1 }).withMessage("Password is required"),
  body("userType")
    .optional()
    .isIn(["user", "vendor"])
    .withMessage("User type must be either user or vendor"),
];

// Routes
router.post("/register/user", userRegistrationValidation, registerUser);
router.post("/register/vendor", vendorRegistrationValidation, registerVendor);
router.post("/login", loginValidation, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getProfile);

module.exports = router;
