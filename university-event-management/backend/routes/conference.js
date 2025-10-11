const express = require("express");
const {
    createConference,
    editConference,
    deleteConference,
    getConference,
} = require("../controllers/conferenceController.js");
const { protect, requireAdminOrEventsOffice } = require("../middleware/auth");

const router = express.Router();

// Apply authentication and authorization to all conference routes
router.use(protect);
router.use(requireAdminOrEventsOffice);

// Route to create a new conference
router.post("/", createConference);

// Route to edit an existing conference
router.put("/:id", editConference);

// Route to delete a conference
router.delete("/:id", deleteConference);

// Route to get a single conference
router.get("/:id", getConference);

module.exports = router;