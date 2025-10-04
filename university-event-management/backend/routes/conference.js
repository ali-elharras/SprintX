const express = require("express");
const {
    createConference,
    editConference,
    deleteConference,
    getConferences,
} = require("../controllers/conferenceController");

const router = express.Router();

// Route to create a new conference
router.post("/", createConference);

// Route to edit an existing conference
router.put("/:id", editConference);

// Route to delete a conference
router.delete("/:id", deleteConference);

// Route to get all conferences
router.get("/", getConferences);

module.exports = router;