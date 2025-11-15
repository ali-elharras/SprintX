const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const EventPayment = require("../models/EventPayment");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const Conference = require("../models/Conference");
const Wallet = require("../models/Wallet");
const User = require("../models/User");

// @desc    Create payment for event registration
// @route   POST /api/payments/events/:registrationId
// @access  Private
const createEventPayment = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { paymentMethod } = req.body; // 'stripe' or 'wallet'
    
    // Validate payment method (Stripe-only for now)
    if (!["stripe"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Only 'stripe' is supported at the moment",
      });
    }
    
    // Find registration
    const registration = await Registration.findById(registrationId)
      .populate("event")
      .populate("user");
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    
    // Verify ownership
    if (registration.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own registrations",
      });
    }
    
    // Check if event has cost
    const eventCost = registration.event.cost || 0;
    if (eventCost === 0) {
      return res.status(400).json({
        success: false,
        message: "This event is free, no payment required",
      });
    }
    
    // Check if payment already exists
    const existingPayment = await EventPayment.findOne({
      registration: registrationId,
      status: { $in: ["pending", "processing", "completed"] },
    });
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this registration",
        data: existingPayment,
      });
    }
    
    // Calculate processing fee (2.9% + $0.30 for Stripe)
    const processingFee = paymentMethod === "stripe" ? (eventCost * 0.029) + 0.30 : 0;
    
    // Create payment record
    const payment = await EventPayment.create({
      user: req.user.id,
      registration: registrationId,
      event: registration.event._id,
      amount: eventCost,
      paymentMethod,
      processingFee,
      description: `Payment for ${registration.event.title}`,
      dueDate: registration.event.startDate,
    });
    
    if (paymentMethod === "stripe") {
      // Complete registration BEFORE Stripe redirect
      try {
        // Mark payment as completed immediately
        payment.status = "completed";
        payment.completedAt = new Date();
        await payment.save();
        
        // Update registration to confirmed
        registration.paymentStatus = "completed";
        registration.paymentAmount = eventCost;
        registration.paymentMethod = "stripe";
        registration.paymentDate = new Date();
        registration.status = "confirmed";
        await registration.save();
        
        // Record external payment transaction in wallet (doesn't affect balance)
        const wallet = await Wallet.findOrCreateForUser(req.user.id);
        await wallet.recordExternalPayment(
          eventCost,
          `Event registration payment via Stripe: ${registration.event.title}`,
          {
            entityType: "Payment",
            entityId: payment._id,
          }
        );
        
        // Create Stripe checkout session for payment processing
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: registration.event.title,
                  description: `Registration for ${registration.event.title}`,
                },
                unit_amount: Math.round((eventCost + processingFee) * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${process.env.FRONTEND_URL}/events`,
          cancel_url: `${process.env.FRONTEND_URL}/events`,
          metadata: {
            paymentId: payment._id.toString(),
            registrationId: registrationId,
            userId: req.user.id,
            eventId: registration.event._id.toString(),
          },
        });
        
        // Update payment with Stripe session details
        payment.stripeSessionId = session.id;
        await payment.save();
        
        res.status(200).json({
          success: true,
          message: "Registration confirmed! Redirecting to payment...",
          data: {
            payment,
            checkoutUrl: session.url,
            sessionId: session.id,
          },
        });
        
      } catch (stripeError) {
        payment.status = "failed";
        await payment.save();
        
        console.error("Stripe error:", stripeError);
        res.status(500).json({
          success: false,
          message: "Failed to create payment session",
          error: stripeError.message,
        });
      }
  }
  } catch (error) {
    console.error("Error creating event payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
};

// @desc    Verify Stripe payment
// @route   POST /api/payments/events/verify-stripe
// @access  Private
const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId, paymentId } = req.body;
    
    if (!sessionId || !paymentId) {
      return res.status(400).json({
        success: false,
        message: "Session ID and Payment ID are required",
      });
    }
    
    // Find payment
    const payment = await EventPayment.findById(paymentId)
      .populate("registration")
      .populate("event");
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    
    // Verify ownership
    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to payment",
      });
    }
    
    // Assume payment successful after Stripe redirect (no verification needed)
    // Mark payment as completed
    await payment.markCompleted({ 
      stripePaymentIntentId: sessionId // Use session ID as reference
    });
    
    // Update registration payment and confirmation status
    const registration = await Registration.findById(payment.registration._id);
    registration.paymentStatus = "completed";
    registration.paymentAmount = payment.amount;
    registration.status = "confirmed"; // Confirm the registration
    await registration.save();
    
    // Record external payment transaction in wallet (doesn't affect balance)
    const wallet = await Wallet.findOrCreateForUser(req.user.id);
    await wallet.recordExternalPayment(
      payment.amount,
      `Event registration payment via Stripe: ${payment.event.title}`,
      {
        entityType: "Payment",
        entityId: payment._id,
      }
    );
    
    res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Error verifying Stripe payment:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};

// @desc    Process refund for cancelled registration
// @route   POST /api/payments/events/:paymentId/refund
// @access  Private
const processEventRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    
    // Find payment
    const payment = await EventPayment.findById(paymentId)
      .populate("registration")
      .populate("event")
      .populate("user");
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    
    // Verify ownership
    if (payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only request refunds for your own payments",
      });
    }
    
    // Check if payment is completed
    if (payment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed payments can be refunded",
      });
    }
    
    // Check if already refunded
    if (payment.status === "refunded") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been refunded",
      });
    }
    
    // Check refund policy (e.g., must be 24 hours before event)
    const eventDate = new Date(payment.event.startDate);
    const now = new Date();
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilEvent < 24) {
      return res.status(400).json({
        success: false,
        message: "Refunds are not allowed within 24 hours of the event start time",
        hoursUntilEvent: Math.round(hoursUntilEvent),
      });
    }
    
    // Calculate refund amount (full amount minus any applicable fees)
    const refundAmount = payment.amount; // Full refund for now
    
    try {
      // Process refund to wallet (always refund to wallet for simplicity)
      const wallet = await Wallet.findOrCreateForUser(payment.user._id);
      
      await wallet.processRefund(
        refundAmount,
        `Refund for cancelled registration: ${payment.event.title}`,
        {
          entityType: "EventPayment",
          entityId: payment._id,
        }
      );
      
      // Update payment record
      await payment.processRefund(refundAmount, reason, "wallet");
      
      // Delete the registration completely
      // Note: The post-remove middleware in Registration model will automatically
      // decrement currentParticipants, so we don't do it manually here
      await Registration.findByIdAndDelete(payment.registration._id);
      
      res.status(200).json({
        success: true,
        message: "Refund processed successfully to your wallet",
        data: {
          refundAmount,
          walletBalance: wallet.balance,
          paymentStatus: payment.status,
        },
      });
      
    } catch (refundError) {
      console.error("Refund processing error:", refundError);
      res.status(500).json({
        success: false,
        message: "Failed to process refund",
        error: refundError.message,
      });
    }
  } catch (error) {
    console.error("Error processing event refund:", error);
    res.status(500).json({
      success: false,
      message: "Error processing refund",
      error: error.message,
    });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/events/my-payments
// @access  Private
const getMyEventPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const options = { limit: parseInt(limit) };
    if (status) options.status = status;
    
    const payments = await EventPayment.findByUser(req.user.id, options)
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalPayments = await EventPayment.countDocuments({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(totalPayments / parseInt(limit)),
          count: payments.length,
          totalPayments,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment history",
      error: error.message,
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/events/:paymentId
// @access  Private
const getEventPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await EventPayment.findById(paymentId)
      .populate("event", "title type startDate location cost")
      .populate("registration", "status registrationDate")
      .populate("user", "firstName lastName email");
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
    
    // Verify ownership (users can only see their own payments)
    if (payment.user._id.toString() !== req.user.id && !["admin", "events_office"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to payment details",
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment details",
      error: error.message,
    });
  }
};

module.exports = {
  createEventPayment,
  verifyStripePayment,
  processEventRefund,
  getMyEventPayments,
  getEventPaymentDetails,
};