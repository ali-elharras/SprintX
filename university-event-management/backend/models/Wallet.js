const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["credit", "debit", "refund", "payment"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount cannot be negative"],
  },
  description: {
    type: String,
    required: true,
    maxlength: [200, "Description cannot exceed 200 characters"],
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ["Event", "Registration", "Workshop", "Payment"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "transactions.relatedEntity.entityType",
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "completed",
  },
});

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      // Temporarily remove min constraint to allow negative balance for payments
      // min: [0, "Wallet balance cannot be negative"],
    },
    totalCredits: {
      type: Number,
      default: 0,
      min: [0, "Total credits cannot be negative"],
    },
    totalDebits: {
      type: Number,
      default: 0,
      min: [0, "Total debits cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "EGP"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    transactions: [transactionSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
walletSchema.index({ user: 1 });
walletSchema.index({ "transactions.date": -1 });

// Virtual for recent transactions (last 10)
walletSchema.virtual("recentTransactions").get(function () {
  return this.transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
});

// Instance method to add credit
walletSchema.methods.addCredit = async function (amount, description, relatedEntity = null) {
  if (amount <= 0) {
    throw new Error("Credit amount must be positive");
  }

  const transaction = {
    type: "credit",
    amount,
    description,
    relatedEntity,
    status: "completed",
  };

  this.transactions.push(transaction);
  this.balance += amount;
  this.totalCredits += amount;

  await this.save();
  return transaction;
};

// Instance method to deduct amount
walletSchema.methods.deduct = async function (amount, description, relatedEntity = null) {
  if (amount <= 0) {
    throw new Error("Debit amount must be positive");
  }

  if (this.balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  const transaction = {
    type: "debit",
    amount,
    description,
    relatedEntity,
    status: "completed",
  };

  this.transactions.push(transaction);
  this.balance -= amount;
  this.totalDebits += amount;

  await this.save();
  return transaction;
};

// Instance method to process refund
walletSchema.methods.processRefund = async function (amount, description, relatedEntity = null) {
  if (amount <= 0) {
    throw new Error("Refund amount must be positive");
  }

  const transaction = {
    type: "refund",
    amount,
    description,
    relatedEntity,
    status: "completed",
  };

  this.transactions.push(transaction);
  this.balance += amount;
  this.totalCredits += amount;

  await this.save();
  return transaction;
};

// Instance method to record external payment (e.g., Stripe) - doesn't affect balance
walletSchema.methods.recordExternalPayment = async function (amount, description, relatedEntity = null) {
  if (amount <= 0) {
    throw new Error("Payment amount must be positive");
  }

  const transaction = {
    type: "payment",
    amount,
    description,
    relatedEntity,
    status: "completed",
  };

  this.transactions.push(transaction);
  // Note: Balance remains unchanged for external payments

  await this.save();
  return transaction;
};

// Static method to find or create wallet for user
walletSchema.statics.findOrCreateForUser = async function (userId) {
  let wallet = await this.findOne({ user: userId });
  
  if (!wallet) {
    wallet = await this.create({ user: userId });
  }
  
  return wallet;
};

// Static method to get wallet with user details
walletSchema.statics.getWithUserDetails = function (userId) {
  return this.findOne({ user: userId })
    .populate("user", "firstName lastName email universityId");
};

module.exports = mongoose.model("Wallet", walletSchema);