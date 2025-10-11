const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');
const { protect, requireAdminOrEventsOffice, authorize } = require('../middleware/auth');

// Route for getting all workshops and creating a new one
router.route('/')
    .get(protect, workshopController.getAllWorkshops) // Protected to enable role-based filtering
    .post(protect, authorize('professor', 'admin', 'events_office', 'staff'), workshopController.createWorkshop); // Temporarily allow staff for testing

// Route for specific workshop operations (Update, Delete)
router.route('/:id')
    .patch(protect, workshopController.updateWorkshop) // Use PATCH for partial updates
    .delete(protect, workshopController.deleteWorkshop);

// Publish a pending workshop into the events collection
router.post('/:id/publish', protect, requireAdminOrEventsOffice, workshopController.publishWorkshop);

// Request edits for a pending workshop
router.post('/:id/request-edit', protect, requireAdminOrEventsOffice, workshopController.requestEditWorkshop);

// Reject a pending workshop
router.post('/:id/reject', protect, requireAdminOrEventsOffice, workshopController.rejectWorkshop);

module.exports = router;