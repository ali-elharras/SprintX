const express = require("express");
const { protect, requireActiveAccount } = require("../middleware/auth");
const { addFavorite, removeFavorite, listFavorites } = require("../controllers/favoritesController");

const router = express.Router();

// All routes require auth and active account
router.use(protect, requireActiveAccount);

// Get my favorites
router.get("/", listFavorites);

// Add favorite
router.post("/", addFavorite); // body: { eventId }

// Remove favorite
router.delete("/:eventId", removeFavorite);

module.exports = router;
