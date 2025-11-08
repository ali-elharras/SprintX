const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const BazaarApplication = require('../models/BazaarApplication');
const BoothApplication = require('../models/BoothApplication');
const Event = require('../models/Event');
const emailService = require('../services/emailService');

// Pricing configuration
const PRICING = {
  bazaar: {
    basePrice: {
      '2x2': 100, // Base price for 2x2 booth in dollars
      '4x4': 200, // Base price for 4x4 booth in dollars
    },
    locationMultiplier: {
      'Main Hall': 1.5,
      'Entrance': 1.3,
      'Courtyard': 1.0,
      'default': 1.0,
    },
  },
  booth: {
    basePrice: {
      '2x2': 150, // Base price per week for 2x2 booth
      '4x4': 300, // Base price per week for 4x4 booth
    },
    locationMultiplier: {
      'Building A': 1.5,
      'Building B': 1.3,
      'Building C': 1.2,
      'Building D': 1.0,
      'default': 1.0,
    },
  },
};

// Calculate payment amount for bazaar application
const calculateBazaarPayment = (boothSize, location) => {
  const basePrice = PRICING.bazaar.basePrice[boothSize] || PRICING.bazaar.basePrice['2x2'];
  const locationMultiplier = PRICING.bazaar.locationMultiplier[location] || PRICING.bazaar.locationMultiplier.default;
  return Math.round(basePrice * locationMultiplier * 100); // Convert to cents
};

// Calculate payment amount for booth application
const calculateBoothPayment = (boothSize, location, durationWeeks) => {
  const basePrice = PRICING.booth.basePrice[boothSize] || PRICING.booth.basePrice['2x2'];
  const locationMultiplier = PRICING.booth.locationMultiplier[location] || PRICING.booth.locationMultiplier.default;
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
      .populate('bazaar')
      .populate('vendor');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify ownership
    if (application.vendor._id.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own applications',
      });
    }

    // Check if application is approved
    if (application.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved applications can proceed to payment',
      });
    }

    // Check if payment is already completed
    if (application.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been completed for this application',
      });
    }

    // Check if payment deadline has passed
    if (application.paymentDeadline && new Date() > application.paymentDeadline) {
      application.paymentStatus = 'expired';
      await application.save();
      return res.status(400).json({
        success: false,
        message: 'Payment deadline has passed',
      });
    }

    // Calculate payment amount
    const amount = calculateBazaarPayment(application.boothSize, application.bazaar.location);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Bazaar Participation Fee - ${application.bazaar.title}`,
              description: `Booth Size: ${application.boothSize}, Location: ${application.bazaar.location}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/vendor/payment-success?session_id={CHECKOUT_SESSION_ID}&type=bazaar&applicationId=${applicationId}`,
      cancel_url: `${process.env.FRONTEND_URL}/vendor/my-participations?payment=cancelled`,
      client_reference_id: applicationId,
      metadata: {
        applicationType: 'bazaar',
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
    console.error('Error creating bazaar checkout session:', error);
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
    const application = await BoothApplication.findById(applicationId).populate('vendor');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify ownership
    if (application.vendor._id.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own applications',
      });
    }

    // Check if application is approved
    if (application.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved applications can proceed to payment',
      });
    }

    // Check if payment is already completed
    if (application.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been completed for this application',
      });
    }

    // Check if payment deadline has passed
    if (application.paymentDeadline && new Date() > application.paymentDeadline) {
      application.paymentStatus = 'expired';
      await application.save();
      return res.status(400).json({
        success: false,
        message: 'Payment deadline has passed',
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
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booth Participation Fee`,
              description: `Booth Size: ${application.boothSize}, Location: ${application.location}, Duration: ${application.durationWeeks} weeks`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/vendor/payment-success?session_id={CHECKOUT_SESSION_ID}&type=booth&applicationId=${applicationId}`,
      cancel_url: `${process.env.FRONTEND_URL}/vendor/my-participations?payment=cancelled`,
      client_reference_id: applicationId,
      metadata: {
        applicationType: 'booth',
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
    console.error('Error creating booth checkout session:', error);
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
    const Model = applicationType === 'bazaar' ? BazaarApplication : BoothApplication;

    // Find the application
    const application = await Model.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify ownership
    if (application.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update application payment status
      const paidAt = new Date();
      application.paymentStatus = 'completed';
      application.paidAt = paidAt;
      application.paymentIntentId = session.payment_intent;
      await application.save();

      // Populate vendor and bazaar (if applicable) for email
      await application.populate('vendor');
      if (applicationType === 'bazaar') {
        await application.populate('bazaar');
      }

      // Send payment receipt email
      try {
        const eventName = applicationType === 'bazaar' 
          ? application.bazaar?.title 
          : 'Booth Request';
        
        await emailService.sendPaymentReceiptEmail(
          application.vendor.email,
          application.vendor.companyName || application.vendor.businessName,
          applicationType,
          eventName,
          application.paymentAmount,
          session.payment_intent,
          paidAt
        );
        console.log('✅ Payment receipt email sent to vendor');
      } catch (emailError) {
        console.error('❌ Failed to send receipt email:', emailError);
        // Don't fail the payment verification if email fails
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: application,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
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
    const Model = applicationType === 'bazaar' ? BazaarApplication : BoothApplication;

    // Find the application
    const application = await Model.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Verify ownership
    if (application.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
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
    console.error('Error getting payment status:', error);
    next(error);
  }
};
