const express = require("express");
const { getUploadedFiles } = require("../controllers/fileController");
const { protect, requireAdminOrEventsOffice } = require("../middleware/auth");

const router = express.Router();

// Admin/Events Office routes
router.get("/uploads", [protect, requireAdminOrEventsOffice], getUploadedFiles);

module.exports = router;
