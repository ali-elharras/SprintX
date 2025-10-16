// routes/bazaarRoutes.js
const express = require("express");
const {
  createBazaar,
  updateBazaar,
  getAllBazaars,
  getBazaarById,
  deleteBazaar,
  getBazaarApplicationByVendor,
} = require("../controllers/bazaarController");
const { protect, authorize, requireVendor } = require("../middleware/auth");

const router = express.Router();

router.get("/", getAllBazaars);
router.get("/:id", getBazaarById);
router.post("/", protect, authorize("events_office", "admin"), createBazaar);
router.put("/:id", protect, authorize("events_office", "admin"), updateBazaar);
router.delete("/:id", protect, authorize("events_office", "admin"), deleteBazaar);

router.get("/:id/application/vendor", protect, requireVendor, getBazaarApplicationByVendor);

module.exports = router;
