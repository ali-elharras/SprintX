const express = require("express");
const {
  createAdminOrEventOffice,
  deleteAdminOrEventOffice,
} = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// Create admin or event office account
router.post("/create-user", createAdminOrEventOffice);

// Delete admin or event office account
router.delete("/delete-user/:id",deleteAdminOrEventOffice);

module.exports = router;
