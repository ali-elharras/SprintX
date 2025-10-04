const express = require("express");
const { getUpcomingBazaars, seedBazaar } = require("../controllers/eventController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.get("/bazaars/upcoming", getUpcomingBazaars);

// Temporary route to seed a bazaar for testing
router.post("/seed/bazaar", seedBazaar);

module.exports = router;
