const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor'); 
const { protect, requireVendor } = require('../middleware/auth');
const { getPendingPayments, getPendingPaymentsSum } = require('../controllers/VendorController');


// Route to get all pending payments for the authenticated vendor
router.get('/payments/pending', protect, requireVendor, getPendingPayments);

// Route to get the sum of all pending payments for the authenticated vendor
router.get('/payments/pending/sum', protect, requireVendor, getPendingPaymentsSum);

module.exports = router;