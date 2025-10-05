const express = require("express");
const {
    createConference,
    editConference,
    deleteConference,
    getConference,
} = require("../controllers/conferenceController.js");

const router = express.Router();

// Route to create a new conference
router.post("/", createConference);

// Route to edit an existing conference
router.put("/:id", editConference);

// Route to delete a conference
router.delete("/:id", deleteConference);

// Route to get a single conference
router.get("/:id", getConference);

module.exports = router;