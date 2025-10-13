const express = require("express");
const { body } = require("express-validator");
const {
  registerUser,
  completeUserRegistration,
  registerVendor,
  login,
  logout,
  getProfile,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  verifyEmail,
  reapplyVerification,
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
    .matches(/^[a-zA-Z0-9._%+-]+@guc\.edu\.eg$/)
    .withMessage("Email must use GUC domain (@guc.edu.eg)"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("requestedRole")
    .isIn(["student", "staff", "ta", "professor"])
    .withMessage(
      "Requested role must be one of: student, staff, ta, professor"
    ),
  body("role")
    .optional()
    .isIn(["student", "staff", "ta", "professor"])
    .withMessage("Role must be one of: student, staff, ta, professor"),
  body("universityId")
    .trim()
    .isLength({ min: 1 })
    .matches(/^[A-Za-z0-9\-_\.]+$/)
    .withMessage(
      "University ID is required and can only contain letters, numbers, and symbols (-, _, .)"
    ),
  body("department")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Department must be less than 100 characters"),
  body("yearOfStudy")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Year of study must be between 1 and 10"),
  body("phoneNumber")
    .optional({ nullable: true, checkFalsy: true })
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
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Contact person first name must be less than 50 characters"),
  body("contactPersonLastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Contact person last name must be less than 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .custom((email) => {
      // Vendor emails should NOT have university domains
      const universityPattern =
        /^[a-zA-Z0-9._%+-]+@(student|staff|ta|professor)\.guc\.edu\.eg$/;
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
  body("businessRegistrationNumber").optional().trim(),
  body("industry")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Industry must be less than 100 characters"),
  body("companySize")
    .optional({ nullable: true, checkFalsy: true })
    .isIn(["startup", "small", "medium", "large", "enterprise"])
    .withMessage(
      "Company size must be one of: startup, small, medium, large, enterprise"
    ),
  body("phoneNumber")
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[\+]?[\d\s\-\(\)]{10,}$/)
    .withMessage("Please provide a valid phone number"),
  body("website")
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage("Please provide a valid website URL"),
  body("address.street")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Street address must be less than 200 characters"),
  body("address.city")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("City must be less than 50 characters"),
  body("address.state")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("State must be less than 50 characters"),
  body("address.zipCode")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[\d\-\s]{5,10}$/)
    .withMessage("Please provide a valid zip code"),
  body("address.country")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Country must be less than 50 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Company description must be less than 1000 characters"),
  body("interestedEventTypes")
    .optional()
    .isArray()
    .custom((value) => {
      if (!value || value.length === 0) return true;
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

// Validation rules for forgot password
const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
];

// Validation rules for reset password
const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

// Validation rules for completing registration
const completeRegistrationValidation = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("verificationEmail")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid verification email is required"),
];

// Routes
router.post("/register/user", userRegistrationValidation, registerUser);
router.post(
  "/complete-registration",
  completeRegistrationValidation,
  completeUserRegistration
);
router.post("/register/vendor", vendorRegistrationValidation, registerVendor);
router.post("/login", loginValidation, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getProfile);

// Password reset routes
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password", resetPasswordValidation, resetPassword);

// Email verification route (after admin approval)
router.get("/verify-email/:token", verifyEmail);

// Reapply for verification route
router.post(
  "/reapply-verification",
  [body("userId").notEmpty().withMessage("User ID is required")],
  reapplyVerification
);

module.exports = router;
