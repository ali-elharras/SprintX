const Wallet = require("../models/Wallet");
const User = require("../models/User");

// @desc    Get user's wallet details
// @route   GET /api/wallet
// @access  Private
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOrCreateForUser(req.user.id);
    
    // Populate user details
    wallet = await Wallet.getWithUserDetails(req.user.id);
    
    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wallet details",
      error: error.message,
    });
  }
};

// @desc    Get wallet transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }
    
    let transactions = wallet.transactions;
    
    // Filter by type if specified
    if (type && ["credit", "debit", "refund", "payment"].includes(type)) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(transactions.length / limit),
          count: paginatedTransactions.length,
          totalTransactions: transactions.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction history",
      error: error.message,
    });
  }
};

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
// @access  Private
const getBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOrCreateForUser(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        currency: wallet.currency,
        totalCredits: wallet.totalCredits,
        totalDebits: wallet.totalDebits,
      },
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wallet balance",
      error: error.message,
    });
  }
};

// @desc    Add credit to wallet (Admin only)
// @route   POST /api/wallet/credit
// @access  Private (Admin)
const addCredit = async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    
    // Validate input
    if (!userId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: "User ID, amount, and description are required",
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be positive",
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Get or create wallet
    const wallet = await Wallet.findOrCreateForUser(userId);
    
    // Add credit
    const transaction = await wallet.addCredit(
      amount,
      description,
      {
        entityType: "User",
        entityId: req.user.id, // Admin who added the credit
      }
    );
    
    res.status(200).json({
      success: true,
      message: "Credit added successfully",
      data: {
        transaction,
        newBalance: wallet.balance,
      },
    });
  } catch (error) {
    console.error("Error adding credit:", error);
    res.status(500).json({
      success: false,
      message: "Error adding credit to wallet",
      error: error.message,
    });
  }
};

// @desc    Get wallet summary statistics (Admin only)
// @route   GET /api/wallet/admin/stats
// @access  Private (Admin)
const getWalletStats = async (req, res) => {
  try {
    const stats = await Wallet.aggregate([
      {
        $group: {
          _id: null,
          totalWallets: { $sum: 1 },
          totalBalance: { $sum: "$balance" },
          totalCredits: { $sum: "$totalCredits" },
          totalDebits: { $sum: "$totalDebits" },
          averageBalance: { $avg: "$balance" },
          activeWallets: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
        },
      },
    ]);
    
    const recentTransactions = await Wallet.aggregate([
      { $unwind: "$transactions" },
      { $sort: { "transactions.date": -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          transaction: "$transactions",
          user: {
            firstName: "$userInfo.firstName",
            lastName: "$userInfo.lastName",
            email: "$userInfo.email",
          },
        },
      },
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          totalWallets: 0,
          totalBalance: 0,
          totalCredits: 0,
          totalDebits: 0,
          averageBalance: 0,
          activeWallets: 0,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Error fetching wallet stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wallet statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getWallet,
  getTransactionHistory,
  getBalance,
  addCredit,
  getWalletStats,
};