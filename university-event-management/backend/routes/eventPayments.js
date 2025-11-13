const express = require("express");
const { body } = require("express-validator");
const {
  createEventPayment,
  verifyStripePayment,
  processEventRefund,
  getMyEventPayments,
  getEventPaymentDetails,
} = require("../controllers/eventPaymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All event payment routes require authentication
router.use(protect);

// Validation middleware
const createPaymentValidation = [
  body("paymentMethod")
    .isIn(["stripe"]) 
    .withMessage("Payment method must be 'stripe'"),
];

const verifyPaymentValidation = [
  body("sessionId")
    .notEmpty()
    .withMessage("Stripe session ID is required"),
  body("paymentId")
    .notEmpty()
    .withMessage("Payment ID is required"),
];

const refundValidation = [
  body("reason")
    .notEmpty()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Refund reason must be between 10 and 500 characters"),
];

// Payment creation and verification routes
router.post("/events/:registrationId", createPaymentValidation, createEventPayment);
router.post("/events/verify-stripe", verifyPaymentValidation, verifyStripePayment);

// Refund routes
router.post("/events/:paymentId/refund", refundValidation, processEventRefund);

// Payment history and details
router.get("/events/my-payments", getMyEventPayments);
router.get("/events/:paymentId", getEventPaymentDetails);

module.exports = router;