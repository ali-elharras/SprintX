const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');

// Route for getting all workshops and creating a new one
router.route('/')
    .get(workshopController.getAllWorkshops)
    .post(workshopController.createWorkshop);

// Route for specific workshop operations (Update, Delete)
router.route('/:id')
    .patch(workshopController.updateWorkshop) // Use PATCH for partial updates
    .delete(workshopController.deleteWorkshop);

module.exports = router;