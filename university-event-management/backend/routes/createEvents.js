const express = require("express");
const router = express.Router();
const eventController = require("../controllers/CreateEvent");

// POST - Create a new event
router.post("/", eventController.createEvent);

module.exports = router;
