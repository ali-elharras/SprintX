const express = require("express");
const {
  createAdminOrEventOffice,
  deleteAdminOrEventOffice,
  getAllUsers,
  getPendingAcademics,
  approveAcademic,
  blockUser,
  unblockUser,
} = require("../controllers/adminController");

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

// Block a user account
router.patch("/block-user/:id", blockUser);

// Unblock a user account
router.patch("/unblock-user/:id", unblockUser);

module.exports = router;
