const express = require("express");
const {
  getWallet,
  getTransactionHistory,
  getBalance,
  addCredit,
  getWalletStats,
} = require("../controllers/walletController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All wallet routes require authentication
router.use(protect);

// User wallet routes
router.get("/", getWallet);
router.get("/balance", getBalance);
router.get("/transactions", getTransactionHistory);

// Admin-only routes
router.post("/credit", authorize("admin", "events_office"), addCredit);
router.get("/admin/stats", authorize("admin"), getWalletStats);

module.exports = router;