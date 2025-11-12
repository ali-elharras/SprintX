const mongoose = require("mongoose");

const eventPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    
    // Payment Details  
    amount: {
      type: Number,
      required: true,
      min: [0, "Payment amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "EGP"],
    },
    
    // Payment Method
    paymentMethod: {
      type: String,
      enum: ["stripe", "wallet", "cash", "bank_transfer"],
      required: true,
    },
    
    // Stripe Payment Details (if applicable)
    stripePaymentIntentId: {
      type: String,
      sparse: true, // Allows multiple null values
    },
    stripeSessionId: {
      type: String,
      sparse: true,
    },
    
    // Wallet Payment Details (if applicable)
    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    
    // Payment Status
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded", "partially_refunded"],
      default: "pending",
    },
    
    // Payment Lifecycle Dates
    paymentDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    
    // Refund Information
    refundAmount: {
      type: Number,
      default: 0,
      min: [0, "Refund amount cannot be negative"],
    },
    refundDate: {
      type: Date,
    },
    refundReason: {
      type: String,
      maxlength: [500, "Refund reason cannot exceed 500 characters"],
    },
    refundMethod: {
      type: String,
      enum: ["wallet", "stripe_refund", "manual"],
    },
    
    // Additional Metadata
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    
    // Fee Information
    processingFee: {
      type: Number,
      default: 0,
      min: [0, "Processing fee cannot be negative"],
    },
    
    // Admin Notes
    adminNotes: {
      type: String,
      maxlength: [500, "Admin notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
eventPaymentSchema.index({ user: 1, status: 1 });
eventPaymentSchema.index({ registration: 1 });
eventPaymentSchema.index({ event: 1 });
eventPaymentSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });
eventPaymentSchema.index({ paymentDate: -1 });

// Virtual for net amount (amount - processing fee)
eventPaymentSchema.virtual("netAmount").get(function () {
  return this.amount - this.processingFee;
});

// Virtual for refund available amount
eventPaymentSchema.virtual("refundableAmount").get(function () {
  return this.amount - this.refundAmount;
});

// Instance method to mark payment as completed
eventPaymentSchema.methods.markCompleted = async function (paymentDetails = {}) {
  this.status = "completed";
  this.paymentDate = new Date();
  
  // Update payment method specific details
  if (paymentDetails.stripePaymentIntentId) {
    this.stripePaymentIntentId = paymentDetails.stripePaymentIntentId;
  }
  if (paymentDetails.walletTransactionId) {
    this.walletTransactionId = paymentDetails.walletTransactionId;
  }
  
  await this.save();
  return this;
};

// Instance method to process refund
eventPaymentSchema.methods.processRefund = async function (refundAmount, reason, method = "wallet") {
  if (refundAmount <= 0) {
    throw new Error("Refund amount must be positive");
  }
  
  if (refundAmount > this.refundableAmount) {
    throw new Error("Refund amount exceeds refundable amount");
  }
  
  this.refundAmount += refundAmount;
  this.refundDate = new Date();
  this.refundReason = reason;
  this.refundMethod = method;
  
  // Update status based on refund amount
  if (this.refundAmount >= this.amount) {
    this.status = "refunded";
  } else {
    this.status = "partially_refunded";
  }
  
  await this.save();
  return this;
};

// Static method to find payments by user
eventPaymentSchema.statics.findByUser = function (userId, options = {}) {
  const query = this.find({ user: userId });
  
  if (options.status) {
    query.where("status").equals(options.status);
  }
  
  if (options.limit) {
    query.limit(options.limit);
  }
  
  return query
    .populate("event", "title type startDate location cost")
    .populate("registration", "status registrationDate")
    .sort({ createdAt: -1 });
};

// Static method to find payments by event
eventPaymentSchema.statics.findByEvent = function (eventId) {
  return this.find({ event: eventId })
    .populate("user", "firstName lastName email universityId")
    .populate("registration", "status registrationDate")
    .sort({ createdAt: -1 });
};

// Static method to get payment statistics
eventPaymentSchema.statics.getPaymentStats = async function (filters = {}) {
  const matchStage = {};
  
  if (filters.startDate && filters.endDate) {
    matchStage.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }
  
  if (filters.eventId) {
    matchStage.event = new mongoose.Types.ObjectId(filters.eventId);
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
        totalRefunded: { $sum: "$refundAmount" },
      },
    },
  ]);
  
  return stats;
};

module.exports = mongoose.model("EventPayment", eventPaymentSchema);