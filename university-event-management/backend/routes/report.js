const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.get('/attendees', protect, authorize('admin', 'events_office'), reportController.getAttendeeReport);
router.get('/sales', protect, authorize('admin', 'events_office'), reportController.getSalesReport);

module.exports = router;