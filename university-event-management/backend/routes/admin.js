const express = require("express");
const {
  createAdminOrEventOffice,
  deleteAdminOrEventOffice,
  getAllUsers,
  getPendingAcademics,
  approveAcademic,
} = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// Create admin or event office account
router.post("/create-user", createAdminOrEventOffice);

// Delete admin or event office account
router.delete("/delete-user/:id", deleteAdminOrEventOffice);

// Get all users
router.get("/users", getAllUsers);

// Get pending academics
router.get("/pending-academics", getPendingAcademics);

// Approve academic
router.patch("/approve-academic/:id", approveAcademic);

module.exports = router;
