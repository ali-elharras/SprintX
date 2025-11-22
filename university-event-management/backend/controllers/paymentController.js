const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const BazaarApplication = require("../models/BazaarApplication");
const BoothApplication = require("../models/BoothApplication");
const Event = require("../models/Event");
const Conference = require("../models/Conference");
const Registration = require("../models/Registration");
const GymRegistration = require("../models/GymRegistration");
const GymSession = require("../models/GymSession");
const User = require("../models/User");
const emailService = require("../services/emailService");
const qrCodeService = require("../services/qrCodeService");

// Pricing configuration
const PRICING = {
  bazaar: {
    basePrice: {
      "2x2": 100, // Base price for 2x2 booth in dollars
      "4x4": 200, // Base price for 4x4 booth in dollars
    },
    locationMultiplier: {
      "Main Hall": 1.5,
      Entrance: 1.3,
      Courtyard: 1.0,
      default: 1.0,
    },
  },
  booth: {
    basePrice: {
      "2x2": 150, // Base price per week for 2x2 booth
      "4x4": 300, // Base price per week for 4x4 booth
    },
  },
};

// Calculate payment amount for bazaar application
const calculateBazaarPayment = (boothSize, location) => {
  const basePrice =
    PRICING.bazaar.basePrice[boothSize] || PRICING.bazaar.basePrice["2x2"];
  const locationMultiplier =
    PRICING.bazaar.locationMultiplier[location] ||
    PRICING.bazaar.locationMultiplier.default;
  return Math.round(basePrice * locationMultiplier * 100); // Convert to cents
};

// Calculate payment amount for booth application
const calculateBoothPayment = (boothSize, location, durationWeeks) => {
  const basePrice =
    PRICING.booth.basePrice[boothSize] || PRICING.booth.basePrice["2x2"];
  const locationMultiplier =
    PRICING.booth.locationMultiplier[location] ||
    PRICING.booth.locationMultiplier.default;
  return Math.round(basePrice * locationMultiplier * durationWeeks * 100); // Convert to cents
};

// @desc    Create Stripe checkout session for bazaar application
// @route   POST /api/payments/create-checkout-session/bazaar/:applicationId
// @access  Private (Vendor)
exports.createBazaarCheckoutSession = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const vendorId = req.vendor._id;

    // Find the application
    const application = await BazaarApplication.findById(applicationId)
      .populate("bazaar")
      .populate("vendor");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify ownership
    if (application.vendor._id.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own applications",
      });
    }

    // Check if application is approved
    if (application.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved applications can proceed to payment",
      });
    }

    // Check if payment is already completed
    if (application.paymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed for this application",
      });
    }

    // Check if payment deadline has passed
    if (
      application.paymentDeadline &&
      new Date() > application.paymentDeadline
    ) {
      application.paymentStatus = "expired";
      await application.save();
      return res.status(400).json({
        success: false,
        message: "Payment deadline has passed",
      });
    }

    // Calculate payment amount
    const amount = calculateBazaarPayment(
      application.boothSize,
      application.bazaar.location
    );

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Bazaar Participation Fee - ${application.bazaar.title}`,
              description: `Booth Size: ${application.boothSize}, Location: ${application.bazaar.location}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/vendor/payment-success?session_id={CHECKOUT_SESSION_ID}&type=bazaar&applicationId=${applicationId}`,
      cancel_url: `${process.env.FRONTEND_URL}/vendor/my-participations?payment=cancelled`,
      client_reference_id: applicationId,
      metadata: {
        applicationType: "bazaar",
        applicationId: applicationId,
        vendorId: vendorId.toString(),
      },
    });

    // Update application with session ID and payment amount
    application.stripeSessionId = session.id;
    application.paymentAmount = amount / 100; // Store in dollars
    await application.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error("Error creating bazaar checkout session:", error);
    next(error);
  }
};

// @desc    Create Stripe checkout session for booth application
// @route   POST /api/payments/create-checkout-session/booth/:applicationId
// @access  Private (Vendor)
exports.createBoothCheckoutSession = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const vendorId = req.vendor._id;

    // Find the application
    const application = await BoothApplication.findById(applicationId).populate(
      "vendor"
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify ownership
    if (application.vendor._id.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own applications",
      });
    }

    // Check if application is approved
    if (application.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved applications can proceed to payment",
      });
    }

    // Check if payment is already completed
    if (application.paymentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed for this application",
      });
    }

    // Check if payment deadline has passed
    if (
      application.paymentDeadline &&
      new Date() > application.paymentDeadline
    ) {
      application.paymentStatus = "expired";
      await application.save();
      return res.status(400).json({
        success: false,
        message: "Payment deadline has passed",
      });
    }

    // Calculate payment amount
    const amount = calculateBoothPayment(
      application.boothSize,
      application.location,
      application.durationWeeks
    );

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booth Participation Fee`,
              description: `Booth Size: ${application.boothSize}, Location: ${application.location}, Duration: ${application.durationWeeks} weeks`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/vendor/payment-success?session_id={CHECKOUT_SESSION_ID}&type=booth&applicationId=${applicationId}`,
      cancel_url: `${process.env.FRONTEND_URL}/vendor/my-participations?payment=cancelled`,
      client_reference_id: applicationId,
      metadata: {
        applicationType: "booth",
        applicationId: applicationId,
        vendorId: vendorId.toString(),
      },
    });

    // Update application with session ID and payment amount
    application.stripeSessionId = session.id;
    application.paymentAmount = amount / 100; // Store in dollars
    await application.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error("Error creating booth checkout session:", error);
    next(error);
  }
};

// @desc    Verify payment and update application status
// @route   POST /api/payments/verify-payment/:applicationType/:applicationId
// @access  Private (Vendor)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { applicationType, applicationId } = req.params;
    const { sessionId } = req.body;
    const vendorId = req.vendor._id;

    // Determine which model to use
    const Model =
      applicationType === "bazaar" ? BazaarApplication : BoothApplication;

    // Find the application
    const application = await Model.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify ownership
    if (application.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (application.paymentStatus === "completed") {
      console.log(
        `Payment for application ${applicationId} already completed. Skipping duplicate processing.`
      );
      return res.status(200).json({
        success: true,
        message: "Payment already verified and completed.",
        data: application,
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Update application payment status
      const paidAt = new Date();
      application.paymentStatus = "completed";
      application.paidAt = paidAt;
      application.paymentIntentId = session.payment_intent;
      await application.save();

      // Populate vendor and bazaar (if applicable) for email
      await application.populate("vendor");
      if (applicationType === "bazaar") {
        await application.populate("bazaar");
      }

      // Send payment receipt email
      try {
        const eventName =
          applicationType === "bazaar"
            ? application.bazaar?.title
            : "Booth Request";

        await emailService.sendPaymentReceiptEmail(
          application.vendor.email,
          application.vendor.companyName || application.vendor.businessName,
          applicationType,
          eventName,
          application.paymentAmount,
          session.payment_intent,
          paidAt
        );
        console.log("✅ Payment receipt email sent to vendor");
      } catch (emailError) {
        console.error("❌ Failed to send receipt email:", emailError);
        // Don't fail the payment verification if email fails
      }

      // Generate and send QR codes to all registered visitors
      try {
        if (application.attendees && application.attendees.length > 0) {
          const eventName =
            applicationType === "bazaar"
              ? application.bazaar?.title
              : "Booth Request";

          const vendorName =
            application.vendor.companyName || application.vendor.businessName;

          // Extract email addresses from attendees array
          const visitorEmails = application.attendees.map(
            (attendee) => attendee.email
          );

          console.log(
            `📧 Found ${visitorEmails.length} visitors:`,
            visitorEmails
          );

          // Generate QR codes for all visitors
          const visitorQRCodes = await qrCodeService.generateVisitorQRCodes(
            visitorEmails,
            {
              vendorId: application.vendor._id,
              eventId:
                applicationType === "bazaar" ? application.bazaar?._id : null,
              eventName,
              applicationType,
              applicationId: application._id,
            }
          );

          console.log(
            `📧 Sending QR codes to ${visitorQRCodes.length} visitors...`
          );

          // Send QR code emails to all visitors
          const emailPromises = visitorQRCodes.map((visitor) =>
            emailService.sendVisitorQRCodeEmail(
              visitor.email,
              vendorName,
              eventName,
              applicationType,
              visitor.qrCodeDataURL,
              visitor.visitorNumber,
              visitorQRCodes.length
            )
          );

          const results = await Promise.allSettled(emailPromises);

          // Log results
          results.forEach((result, index) => {
            if (result.status === "fulfilled") {
              console.log(`✅ QR code email sent to visitor ${index + 1}`);
            } else {
              console.error(
                `❌ Failed to send QR code to visitor ${index + 1}:`,
                result.reason
              );
            }
          });

          console.log("✅ QR code email process completed");
        } else {
          console.log("⚠️ No attendees found in application");
        }
      } catch (qrError) {
        console.error("❌ Failed to send QR codes:", qrError);
        console.error("Error stack:", qrError.stack);
        // Don't fail the payment verification if QR code sending fails
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: application,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    next(error);
  }
};

// @desc    Get payment status for an application
// @route   GET /api/payments/status/:applicationType/:applicationId
// @access  Private (Vendor)
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { applicationType, applicationId } = req.params;
    const vendorId = req.vendor._id;

    // Determine which model to use
    const Model =
      applicationType === "bazaar" ? BazaarApplication : BoothApplication;

    // Find the application
    const application = await Model.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify ownership
    if (application.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: application.paymentStatus,
        paymentAmount: application.paymentAmount,
        paymentDeadline: application.paymentDeadline,
        paidAt: application.paidAt,
      },
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    next(error);
  }
};

// @desc    Create Stripe checkout session for event registration
// @route   POST /api/payments/create-checkout-session/registration
// @route   POST /api/payments/create-checkout-session/registration/:registrationId (legacy)
// @access  Private
exports.createRegistrationCheckoutSession = async (req, res, next) => {
  try {
    const { paymentMethod, registrationData } = req.body;
    const { registrationId } = req.params; // Legacy support
    const userId = req.user.id;

    // Handle legacy flow (old pending registrations with registrationId in URL)
    if (registrationId && !registrationData) {
      const registration = await Registration.findById(registrationId).populate(
        "event"
      );

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Registration not found",
        });
      }

      // Verify ownership
      if (
        registration.user &&
        registration.user.toString() !== userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only pay for your own registrations",
        });
      }

      // Check if already paid
      if (registration.paymentStatus === "completed") {
        return res.status(400).json({
          success: false,
          message: "Payment has already been completed for this registration",
        });
      }

      // Continue with legacy flow - update existing registration
      const amount = Math.round(
        (registration.paymentAmount || registration.event.cost || 0) * 100
      );

      if (amount === 0) {
        registration.paymentStatus = "completed";
        registration.paymentMethod = "free";
        registration.paymentDate = new Date();
        registration.status = "confirmed";
        await registration.save();

        return res.status(200).json({
          success: true,
          message: "Registration confirmed for free event",
          data: { paymentMethod: "free" },
        });
      }

      // Handle wallet payment for legacy
      if (paymentMethod === "balance") {
        const Wallet = require("../models/Wallet");
        const wallet = await Wallet.findOrCreateForUser(userId);

        if (wallet.balance < amount / 100) {
          return res.status(400).json({
            success: false,
            message: "Insufficient wallet balance",
          });
        }

        await wallet.deduct(
          amount / 100,
          `Payment for event registration: ${registration.event.title}`,
          {
            entityType: "Registration",
            entityId: registration._id,
          }
        );

        registration.paymentStatus = "completed";
        registration.paymentMethod = "balance";
        registration.paymentDate = new Date();
        registration.status = "confirmed";
        await registration.save();

        // Send payment receipt email for legacy wallet payment
        try {
          console.log(
            "[Payment Receipt - Wallet Legacy] Starting to send receipt email..."
          );
          const user = await User.findById(userId);
          const emailService = require("../services/emailService");

          const eventDetails = {
            title: registration.event.title,
            type: registration.event.type,
            date: registration.event.startDate,
            location: registration.event.location || "TBA",
          };

          const paymentDetails = {
            amount: amount / 100,
            method: "Wallet Balance",
            date: new Date(),
            transactionId: registration._id,
          };

          await emailService.sendPaymentReceipt(
            user,
            eventDetails,
            paymentDetails
          );
          console.log(
            "[Payment Receipt - Wallet Legacy] ✅ Email sent successfully"
          );
        } catch (emailError) {
          console.error(
            "[Payment Receipt - Wallet Legacy] ❌ Failed to send email:",
            emailError
          );
          // Don't fail the request if email fails
        }

        return res.status(200).json({
          success: true,
          message: "Payment completed using wallet",
          data: {
            paymentMethod: "balance",
            amountPaid: amount / 100,
            registration,
          },
        });
      }

      // Handle Stripe payment for legacy
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Event Registration - ${registration.event.title}`,
                description: `Registration for ${registration.event.type} event`,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/events`,
        cancel_url: `${process.env.FRONTEND_URL}/events`,
        client_reference_id: registrationId,
        metadata: {
          registrationType: "event",
          registrationId: registrationId,
          userId: userId.toString(),
        },
      });

      registration.stripeSessionId = session.id;
      await registration.save();

      return res.status(200).json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    }

    // NEW FLOW: Validate registration data
    if (!registrationData || !registrationData.eventId) {
      return res.status(400).json({
        success: false,
        message: "Registration data is required",
      });
    }

    // Find the event
    let event = await Event.findById(registrationData.eventId);
    let isConference = false;

    if (!event) {
      event = await Conference.findById(registrationData.eventId);
      isConference = true;
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Get payment amount
    const eventCost = isConference ? event.cost || 0 : event.cost || 0;
    const amount = Math.round(eventCost * 100); // Convert to cents

    if (amount === 0) {
      return res.status(400).json({
        success: false,
        message: "This is a free event, no payment required",
      });
    }

    // CRITICAL: Check for duplicate registration BEFORE processing payment
    const existingRegistration = await Registration.findOne({
      event: registrationData.eventId,
      status: { $in: ["pending", "confirmed", "attended"] },
      $or: [
        { email: registrationData.email.toLowerCase() },
        { universityId: registrationData.universityId },
      ],
    });

    if (existingRegistration) {
      const statusMessage =
        existingRegistration.status === "pending"
          ? "You have a pending registration for this event. Please complete payment or cancel the existing registration first."
          : "You are already registered for this event";

      return res.status(400).json({
        success: false,
        message: statusMessage,
      });
    }

    // Handle wallet payment
    if (paymentMethod === "balance") {
      const Wallet = require("../models/Wallet");
      const wallet = await Wallet.findOrCreateForUser(userId);

      if (wallet.balance < eventCost) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance",
        });
      }

      // Deduct from wallet
      await wallet.deduct(
        eventCost,
        `Payment for event registration: ${event.title}`,
        {
          entityType: "Event",
          entityId: event._id,
        }
      );

      // Now create the registration after successful payment
      const newRegistration = await Registration.create({
        event: registrationData.eventId,
        user: userId,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        universityId: registrationData.universityId,
        paymentStatus: "completed",
        paymentMethod: "balance",
        paymentAmount: eventCost,
        paymentDate: new Date(),
        status: "confirmed",
      });

      // Send payment receipt email
      try {
        console.log(
          "[Payment Receipt - Wallet] Starting to send receipt email..."
        );
        const user = await User.findById(userId);
        const emailService = require("../services/emailService");

        const eventDetails = {
          title: event.title,
          type: isConference ? "Conference" : event.type,
          date: event.startDate,
          location: event.location || "TBA",
        };

        const paymentDetails = {
          amount: eventCost,
          method: "Wallet Balance",
          date: new Date(),
          transactionId: newRegistration._id,
        };

        await emailService.sendPaymentReceipt(
          user,
          eventDetails,
          paymentDetails
        );
        console.log("✅ Payment receipt email sent");
      } catch (emailError) {
        console.error("❌ Failed to send payment receipt:", emailError.message);
        // Don't fail the request if email fails
      }

      return res.status(200).json({
        success: true,
        message: "Payment completed using wallet and registration confirmed",
        data: {
          paymentMethod: "balance",
          amountPaid: eventCost,
          registration: newRegistration,
        },
      });
    }

    // Handle Stripe payment - Create registration BEFORE redirect
    // Create the registration immediately
    const newRegistration = await Registration.create({
      event: registrationData.eventId,
      user: userId,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      email: registrationData.email,
      universityId: registrationData.universityId,
      paymentStatus: "completed",
      paymentMethod: "stripe",
      paymentAmount: eventCost,
      paymentDate: new Date(),
      status: "confirmed",
    });

    // Record external payment transaction in wallet (doesn't affect balance)
    const Wallet = require("../models/Wallet");
    const wallet = await Wallet.findOrCreateForUser(userId);
    await wallet.recordExternalPayment(
      eventCost,
      `Event registration payment via Stripe: ${event.title}`,
      {
        entityType: "Registration",
        entityId: newRegistration._id,
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
              name: `Event Registration - ${event.title}`,
              description: `Registration for ${
                isConference ? "conference" : event.type
              } event`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/events?session_id={CHECKOUT_SESSION_ID}&registration_id=${newRegistration._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/events`,
      client_reference_id: userId.toString(),
      metadata: {
        registrationType: "event",
        eventId: registrationData.eventId,
        registrationId: newRegistration._id.toString(),
        userId: userId.toString(),
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        email: registrationData.email,
        universityId: registrationData.universityId,
        paymentAmount: eventCost.toString(),
      },
    });

    // Store session ID in registration
    newRegistration.stripeSessionId = session.id;
    await newRegistration.save();

    res.status(200).json({
      success: true,
      message: "Registration confirmed! Redirecting to payment...",
      data: {
        sessionId: session.id,
        url: session.url,
        registration: newRegistration,
      },
    });
  } catch (error) {
    console.error("Error creating registration checkout session:", error);
    next(error);
  }
};

// @desc    Create Stripe checkout session for gym session registration
// @route   POST /api/payments/create-checkout-session/gym/:gymRegistrationId
// @access  Private
exports.createGymCheckoutSession = async (req, res, next) => {
  try {
    const { gymRegistrationId } = req.params;
    const { paymentMethod } = req.body; // 'stripe' or 'balance'
    const userId = req.user.id;

    // Find the gym registration
    const gymRegistration = await GymRegistration.findById(
      gymRegistrationId
    ).populate("gymSession");

    if (!gymRegistration) {
      return res.status(404).json({
        success: false,
        message: "Gym registration not found",
      });
    }

    // Verify ownership
    if (gymRegistration.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own registrations",
      });
    }

    // Check if payment is already completed
    if (
      gymRegistration.paymentStatus === "completed" ||
      gymRegistration.paymentStatus === "paid"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed for this registration",
      });
    }

    // Get payment amount from gym session
    const amount = Math.round(
      (gymRegistration.amountPaid || gymRegistration.gymSession.cost || 0) * 100
    ); // Convert to cents

    if (amount === 0) {
      // Free session - auto-confirm
      gymRegistration.paymentStatus = "paid";
      gymRegistration.paymentMethod = "free";
      gymRegistration.paymentDate = new Date();
      gymRegistration.status = "active";
      await gymRegistration.save();

      return res.status(200).json({
        success: true,
        message: "Registration confirmed for free session",
        data: { paymentMethod: "free" },
      });
    }

    // Handle balance payment
    if (paymentMethod === "balance") {
      const user = await User.findById(userId);

      if (!user.balance || user.balance < amount / 100) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance",
        });
      }

      // Deduct from balance
      user.balance -= amount / 100;
      await user.save();

      // Update gym registration
      gymRegistration.paymentStatus = "paid";
      gymRegistration.paymentMethod = "balance";
      gymRegistration.paymentDate = new Date();
      gymRegistration.amountPaid = amount / 100;
      gymRegistration.status = "active";
      await gymRegistration.save();

      return res.status(200).json({
        success: true,
        message: "Payment completed using balance",
        data: { paymentMethod: "balance", amountPaid: amount / 100 },
      });
    }

    // Handle Stripe payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Gym Session - ${gymRegistration.gymSession.title}`,
              description: `${gymRegistration.gymSession.type} session`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&type=gym&gymRegistrationId=${gymRegistrationId}`,
      cancel_url: `${process.env.FRONTEND_URL}/fitness?payment=cancelled`,
      client_reference_id: gymRegistrationId,
      metadata: {
        registrationType: "gym",
        gymRegistrationId: gymRegistrationId,
        userId: userId.toString(),
      },
    });

    // Update gym registration with session ID
    gymRegistration.stripeSessionId = session.id;
    await gymRegistration.save();

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error("Error creating gym checkout session:", error);
    next(error);
  }
};

// @desc    Verify payment for event registration
// @route   POST /api/payments/verify-payment/registration
// @route   POST /api/payments/verify-payment/registration/:registrationId (legacy)
// @access  Private
exports.verifyRegistrationPayment = async (req, res, next) => {
  console.log("🔔 VERIFY REGISTRATION PAYMENT CALLED");
  console.log("Request body:", req.body);
  console.log("Request params:", req.params);

  try {
    const { sessionId } = req.body;
    const { registrationId } = req.params; // Legacy support
    const userId = req.user.id;

    console.log("Session ID:", sessionId);
    console.log("User ID:", userId);

    // Retrieve the session from Stripe
    console.log("💳 Retrieving Stripe session...");
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(
      "💳 Stripe session retrieved. Payment status:",
      session.payment_status
    );

    if (session.payment_status !== "paid") {
      console.log("❌ Payment not completed, returning error");
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    console.log("✅ Payment is paid, processing...");

    // Handle legacy flow (registrationId in metadata)
    const metadata = session.metadata;
    console.log("📋 Session metadata:", metadata);
    if (metadata && metadata.registrationId) {
      console.log("🔄 Using LEGACY flow (metadata has registrationId)");
      // Legacy: Update existing registration
      const registration = await Registration.findById(
        metadata.registrationId
      ).populate("event");

      if (!registration) {
        console.log("❌ Registration not found");
        return res.status(404).json({
          success: false,
          message: "Registration not found",
        });
      }

      console.log(
        "📝 Registration found. Current payment status:",
        registration.paymentStatus
      );

      if (registration.paymentStatus === "completed") {
        console.log("✅ Payment already completed, sending email now...");

        // Send payment receipt email even if already completed
        try {
          const user = await User.findById(userId);
          const emailService = require("../services/emailService");

          const eventDetails = {
            title: registration.event.title,
            type: registration.event.type,
            date: registration.event.startDate,
            location: registration.event.location || "TBA",
          };

          const paymentDetails = {
            amount: registration.paymentAmount,
            method: "Credit Card (Stripe)",
            date: registration.paymentDate || new Date(),
            transactionId: registration._id,
          };

          await emailService.sendPaymentReceipt(
            user,
            eventDetails,
            paymentDetails
          );
          console.log("✅ Payment receipt email sent");
        } catch (emailError) {
          console.error(
            "❌ Failed to send payment receipt:",
            emailError.message
          );
        }

        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          data: registration,
        });
      }

      registration.paymentStatus = "completed";
      registration.status = "confirmed";
      registration.paymentDate = new Date();
      registration.stripePaymentIntentId = session.payment_intent;
      await registration.save();

      // Send payment receipt email for legacy flow
      try {
        const user = await User.findById(userId);
        const emailService = require("../services/emailService");

        const eventDetails = {
          title: registration.event.title,
          type: registration.event.type,
          date: registration.event.startDate,
          location: registration.event.location || "TBA",
        };

        const paymentDetails = {
          amount: registration.paymentAmount,
          method: "Credit Card (Stripe)",
          date: new Date(),
          transactionId: registration._id,
        };

        await emailService.sendPaymentReceipt(
          user,
          eventDetails,
          paymentDetails
        );
        console.log("✅ Payment receipt email sent");
      } catch (emailError) {
        console.error("❌ Failed to send payment receipt:", emailError.message);
        // Don't fail the request if email fails
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: registration,
      });
    }

    // NEW FLOW: Create registration from metadata
    if (!metadata || !metadata.eventId) {
      return res.status(400).json({
        success: false,
        message: "Invalid session metadata",
      });
    }

    // Check if registration already exists for this session
    console.log(
      "🔍 Checking for existing registration with session:",
      sessionId
    );
    const existingRegistration = await Registration.findOne({
      stripeSessionId: sessionId,
    }).populate("event");

    console.log("📝 Existing registration found:", !!existingRegistration);

    if (existingRegistration) {
      console.log("✅ Found existing registration, sending email...");
      // Send payment receipt email (registration was created during checkout)
      try {
        const user = await User.findById(userId);
        const emailService = require("../services/emailService");

        const eventDetails = {
          title: existingRegistration.event.title,
          type: existingRegistration.event.type,
          date: existingRegistration.event.startDate,
          location: existingRegistration.event.location || "TBA",
        };

        const paymentDetails = {
          amount: existingRegistration.paymentAmount,
          method: "Credit Card (Stripe)",
          date: existingRegistration.paymentDate || new Date(),
          transactionId: existingRegistration._id,
        };

        await emailService.sendPaymentReceipt(
          user,
          eventDetails,
          paymentDetails
        );
        console.log("✅ Payment receipt email sent");
      } catch (emailError) {
        console.error("❌ Failed to send payment receipt:", emailError.message);
        // Don't fail the request if email fails
      }

      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: existingRegistration,
      });
    }

    // CRITICAL: Check for duplicate registration by email/universityId before creating
    const duplicateCheck = await Registration.findOne({
      event: metadata.eventId,
      status: { $in: ["pending", "confirmed", "attended"] },
      $or: [
        { email: metadata.email.toLowerCase() },
        { universityId: metadata.universityId },
      ],
    });

    if (duplicateCheck) {
      return res.status(400).json({
        success: false,
        message:
          "You are already registered for this event. Payment cannot be completed.",
        error: "DUPLICATE_REGISTRATION",
      });
    }

    // Create the registration after successful payment
    const registration = await Registration.create({
      event: metadata.eventId,
      user: userId,
      firstName: metadata.firstName,
      lastName: metadata.lastName,
      email: metadata.email,
      universityId: metadata.universityId,
      paymentStatus: "completed",
      paymentMethod: "stripe",
      paymentAmount: parseFloat(metadata.paymentAmount),
      paymentDate: new Date(),
      status: "confirmed",
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent,
    });

    await registration.populate("event");

    // Send payment receipt email
    try {
      console.log(
        "[Payment Receipt - Stripe Verify] Starting to send receipt email..."
      );
      const user = await User.findById(userId);
      const emailService = require("../services/emailService");

      const eventDetails = {
        title: registration.event.title,
        type: registration.event.type,
        date: registration.event.startDate,
        location: registration.event.location || "TBA",
      };

      const paymentDetails = {
        amount: parseFloat(metadata.paymentAmount),
        method: "Credit Card (Stripe)",
        date: new Date(),
        transactionId: registration._id,
      };

      await emailService.sendPaymentReceipt(user, eventDetails, paymentDetails);
      console.log(
        "[Payment Receipt - Stripe Verify] ✅ Email sent successfully"
      );
    } catch (emailError) {
      console.error(
        "[Payment Receipt - Stripe Verify] ❌ Failed to send email:",
        emailError
      );
      // Don't fail the request if email fails
    }

    return res.status(201).json({
      success: true,
      message: "Payment verified and registration created successfully",
      data: registration,
    });
  } catch (error) {
    console.error("Error verifying registration payment:", error);
    next(error);
  }
};

// @desc    Verify payment for gym registration
// @route   POST /api/payments/verify-payment/gym/:gymRegistrationId
// @access  Private
exports.verifyGymPayment = async (req, res, next) => {
  try {
    const { gymRegistrationId } = req.params;
    const { sessionId } = req.body;
    const userId = req.user.id;

    const gymRegistration = await GymRegistration.findById(
      gymRegistrationId
    ).populate("gymSession");

    if (!gymRegistration) {
      return res.status(404).json({
        success: false,
        message: "Gym registration not found",
      });
    }

    // Verify ownership
    if (gymRegistration.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      gymRegistration.paymentStatus === "paid" ||
      gymRegistration.paymentStatus === "completed"
    ) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: gymRegistration,
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Update gym registration
      gymRegistration.paymentStatus = "paid";
      gymRegistration.status = "active";
      gymRegistration.paymentDate = new Date();
      gymRegistration.stripePaymentIntentId = session.payment_intent;
      await gymRegistration.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: gymRegistration,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Error verifying gym payment:", error);
    next(error);
  }
};
