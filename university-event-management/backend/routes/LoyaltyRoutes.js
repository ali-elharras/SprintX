const {createLoyaltyProgram, cancelLoyaltyProgram, getLoyaltyProgramsByVendor, getAllLoyaltyPrograms} = require("../controllers/LoyaltyProgramController")
const express = require("express");
const { protect, requireVendor } = require("../middleware/auth");

const router = express.Router();

// Get all loyalty programs (accessible to all authenticated users)
router.get("/all", protect, getAllLoyaltyPrograms);

// Vendor routes for loyalty programs
router.get("/", [protect, requireVendor], getLoyaltyProgramsByVendor);
router.post("/", [protect, requireVendor], createLoyaltyProgram);
router.delete("/:id", [protect, requireVendor], cancelLoyaltyProgram);

module.exports = router;