const express = require('express');
const router = express.Router();
const {
  createBazaarCheckoutSession,
  createBoothCheckoutSession,
  verifyPayment,
  getPaymentStatus,
  createRegistrationCheckoutSession,
  createGymCheckoutSession,
  verifyRegistrationPayment,
  verifyGymPayment,
} = require('../controllers/paymentController');
const { protect, requireVendor } = require('../middleware/auth');

// Vendor payment routes
router.post('/create-checkout-session/bazaar/:applicationId', protect, requireVendor, createBazaarCheckoutSession);
router.post('/create-checkout-session/booth/:applicationId', protect, requireVendor, createBoothCheckoutSession);
router.post('/verify-payment/:applicationType/:applicationId', protect, requireVendor, verifyPayment);
router.get('/status/:applicationType/:applicationId', protect, requireVendor, getPaymentStatus);

// User payment routes for event registrations
// New flow: no registrationId needed - registrationData passed in body
router.post('/create-checkout-session/registration', protect, createRegistrationCheckoutSession);
router.post('/verify-payment/registration', protect, verifyRegistrationPayment);
// Legacy routes for backward compatibility (if any old pending registrations exist)
router.post('/create-checkout-session/registration/:registrationId', protect, createRegistrationCheckoutSession);
router.post('/verify-payment/registration/:registrationId', protect, verifyRegistrationPayment);

// User payment routes for gym registrations
router.post('/create-checkout-session/gym/:gymRegistrationId', protect, createGymCheckoutSession);
router.post('/verify-payment/gym/:gymRegistrationId', protect, verifyGymPayment);

module.exports = router;
