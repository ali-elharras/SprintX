const BazaarApplication = require("../models/BazaarApplication");
const BoothApplication = require("../models/BoothApplication");
const Event = require("../models/Event");

// @desc    Apply to a bazaar
// @route   POST /api/applications/bazaar/:bazaarId
// @access  Private (Vendor)
const applyToBazaar = async (req, res, next) => {
  try {
    const { bazaarId } = req.params;
    const { attendees, boothSize } = req.body;
    const vendorId = req.vendor._id;

    // Check if the bazaar exists and is upcoming
    const bazaar = await Event.findById(bazaarId);
    if (!bazaar) {
      return res.status(404).json({
        success: false,
        message: "Bazaar not found or is not available for application",
      });
    }

    // Check for existing application
    const existingApplication = await BazaarApplication.findOne({ vendor: vendorId, bazaar: bazaarId });
    if (existingApplication) {
        return res.status(400).json({ success: false, message: "You have already applied to this bazaar." });
    }

    const application = await BazaarApplication.create({
      vendor: vendorId,
      bazaar: bazaarId,
      attendees,
      boothSize,
    });

    res.status(201).json({
      success: true,
      message: "Successfully applied to the bazaar.",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for a booth
// @route   POST /api/applications/booth
// @access  Private (Vendor)
const applyForBooth = async (req, res, next) => {
  try {
    const { attendees, startDate, endDate, durationWeeks, location, boothSize } = req.body;
    const vendorId = req.vendor._id;

    // Check for existing pending booth application for this vendor
    const existingPendingApplication = await BoothApplication.findOne({
      vendor: vendorId,
      status: "pending",
    });

    if (existingPendingApplication) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending booth application. Please wait for it to be approved or rejected before applying for another.",
      });
    }

    const application = await BoothApplication.create({
      vendor: vendorId,
      attendees,
      startDate,
      endDate,
      durationWeeks,
      location,
      boothSize,
    });

    res.status(201).json({
      success: true,
      message: "Successfully applied for the booth.",
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all upcoming participations (approved requests)
// @route   GET /api/applications/my-participations
// @access  Private (Vendor)
const getMyParticipations = async (req, res, next) => {
  try {
    const vendorId = req.vendor._id;

    const bazaarParticipations = await BazaarApplication.find({
      vendor: vendorId,
      status: "approved",
    }).populate({
      path: "bazaar",
      match: { startDate: { $gte: new Date() } }, // Only upcoming events
    });

    const boothParticipations = await BoothApplication.find({
      vendor: vendorId,
      status: "approved",
    });

    // Filter out bazaar participations where the event is not upcoming
    const upcomingBazaarParticipations = bazaarParticipations.filter(p => p.bazaar);

    res.status(200).json({
      success: true,
      data: {
        bazaars: upcomingBazaarParticipations,
        booths: boothParticipations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending/rejected requests
// @route   GET /api/applications/my-requests
// @access  Private (Vendor)
const getMyRequests = async (req, res, next) => {
  try {
    const vendorId = req.vendor._id;

    const bazaarRequests = await BazaarApplication.find({
      vendor: vendorId,
      status: { $in: ["pending", "rejected"] },
    }).populate("bazaar");

    const boothRequests = await BoothApplication.find({
      vendor: vendorId,
      status: { $in: ["pending", "rejected"] },
    });

    res.status(200).json({
      success: true,
      data: {
        bazaars: bazaarRequests,
        booths: boothRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (for admins)
// @route   GET /api/applications
// @access  Private (Admin/Events Office)
const getAllApplications = async (req, res, next) => {
    try {
        const { status } = req.query;
        let bazaarQuery = {};
        let boothQuery = {};

        if (status) {
            bazaarQuery.status = status;
            boothQuery.status = status;
        }

        const bazaarApplications = await BazaarApplication.find(bazaarQuery, 'vendor bazaar attendees boothSize status').populate("vendor", "companyName email").populate("bazaar", "title startDate");
        const boothApplications = await BoothApplication.find(boothQuery, 'vendor attendees startDate endDate durationWeeks location boothSize status').populate("vendor", "companyName email");
        

        res.status(200).json({
            success: true,
            data: {
                bazaarApplications,
                boothApplications
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update application status (for admins)
// @route   PUT /api/applications/:applicationType/:applicationId/status
// @access  Private (Admin/Events Office)
const updateApplicationStatus = async (req, res, next) => {
    try {
        const { applicationType, applicationId } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status." });
        }

        let application;
        const model = applicationType === 'bazaar' ? BazaarApplication : BoothApplication;
        
        if (!model) {
            return res.status(400).json({ success: false, message: "Invalid application type." });
        }

        application = await model.findByIdAndUpdate(applicationId, { status }, { new: true, runValidators: true });

        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }

        res.status(200).json({
            success: true,
            message: `Application has been ${status}.`,
            data: application
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
  applyToBazaar,
  applyForBooth,
  getMyParticipations,
  getMyRequests,
  getAllApplications,
  updateApplicationStatus,
};
