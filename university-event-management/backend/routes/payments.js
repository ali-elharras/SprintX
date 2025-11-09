const express = require('express');
const router = express.Router();
const {
  createBazaarCheckoutSession,
  createBoothCheckoutSession,
  verifyPayment,
  getPaymentStatus,
} = require('../controllers/paymentController');
const { protect, requireVendor } = require('../middleware/auth');

// Create checkout session routes
router.post('/create-checkout-session/bazaar/:applicationId', protect, requireVendor, createBazaarCheckoutSession);
router.post('/create-checkout-session/booth/:applicationId', protect, requireVendor, createBoothCheckoutSession);

// Verify payment
router.post('/verify-payment/:applicationType/:applicationId', protect, requireVendor, verifyPayment);

// Get payment status
router.get('/status/:applicationType/:applicationId', protect, requireVendor, getPaymentStatus);

module.exports = router;
