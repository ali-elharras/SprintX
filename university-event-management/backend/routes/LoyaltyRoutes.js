const {createLoyaltyProgram, cancelLoyaltyProgram, getLoyaltyProgramsByVendor} = require("../controllers/LoyaltyProgramController")
const express = require("express");
const { protect, requireVendor } = require("../middleware/auth");

const router = express.Router();

// Vendor routes for loyalty programs
router.get("/", [protect, requireVendor], getLoyaltyProgramsByVendor);
router.post("/", [protect, requireVendor], createLoyaltyProgram);
router.delete("/:id", [protect, requireVendor], cancelLoyaltyProgram);

module.exports = router;