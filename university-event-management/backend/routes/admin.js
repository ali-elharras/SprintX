const express = require("express");
const {
  createAdminOrEventOffice,
  deleteAdminOrEventOffice,
  getAllUsers,
} = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// Create admin or event office account
router.post("/create-user", createAdminOrEventOffice);

// Delete admin or event office account
router.delete("/delete-user/:id",deleteAdminOrEventOffice);

router.get("/users", getAllUsers);

module.exports = router;
