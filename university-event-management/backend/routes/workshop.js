const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');
const { protect, requireAdminOrEventsOffice } = require('../middleware/auth');

// Route for getting all workshops and creating a new one
router.route('/')
    .get(workshopController.getAllWorkshops)
    .post(workshopController.createWorkshop);

// Route for specific workshop operations (Update, Delete)
router.route('/:id')
    .patch(workshopController.updateWorkshop) // Use PATCH for partial updates
    .delete(workshopController.deleteWorkshop);

// Publish a pending workshop into the events collection
router.post('/:id/publish', protect, requireAdminOrEventsOffice, workshopController.publishWorkshop);

// Request edits for a pending workshop
router.post('/:id/request-edit', protect, requireAdminOrEventsOffice, workshopController.requestEditWorkshop);

module.exports = router;