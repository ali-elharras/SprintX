// routes/bazaarRoutes.js
const express = require("express");
const {
  createBazaar,
  updateBazaar,
  getAllBazaars,
  getBazaarById,
  deleteBazaar,
} = require("../controllers/bazaarController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllBazaars);
router.get("/:id", getBazaarById);
router.post("/", protect, authorize("events_office", "admin"), createBazaar);
router.put("/:id", protect, authorize("events_office", "admin"), updateBazaar);
router.delete("/:id", protect, authorize("events_office", "admin"), deleteBazaar);

module.exports = router;
