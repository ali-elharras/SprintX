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
    const vendorId = req.user._id;

    // Check if the bazaar exists and is upcoming
    const bazaar = await Event.findById(bazaarId);
    if (!bazaar) {
      return res.status(404).json({
        success: false,
        message: "Bazaar not found or is not available for application",
      });
    }

    let application = await BazaarApplication.findOne({ vendor: vendorId, bazaar: bazaarId });

    if (application) {
      // Application exists
      if (application.status === 'rejected') {
        // If rejected, allow re-application by updating the existing one
        application.attendees = attendees;
        application.boothSize = boothSize;
        application.status = 'pending'; // Reset status to pending
        await application.save();

        return res.status(200).json({
          success: true,
          message: "Successfully re-applied to the bazaar.",
          data: application,
        });
      } else {
        // If pending or approved, do not allow to apply again
        return res.status(400).json({ success: false, message: "You have already applied to this bazaar and your application is pending or approved." });
      }
    } else {
      // No application exists, create a new one
      application = await BazaarApplication.create({
        vendor: vendorId,
        bazaar: bazaarId,
        attendees,
        boothSize,
      });

      return res.status(201).json({
        success: true,
        message: "Successfully applied to the bazaar.",
        data: application,
      });
    }
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
    const vendorId = req.user._id;

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

    // Check if the booth location is available for the requested dates
    const availabilityCheck = await checkBoothAvailability(startDate, endDate, location);
    if (!availabilityCheck.isAvailable) {
      return res.status(409).json({
        success: false,
        message: `The booth location ${location} is already occupied during the requested period.`,
        data: {
          conflicts: availabilityCheck.conflicts,
          conflictCount: availabilityCheck.conflictCount
        }
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
    const vendorId = req.user._id;

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
    const vendorId = req.user._id;

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

// @desc    Get applications for a specific bazaar (for event cards)
// @route   GET /api/applications/bazaar/:bazaarId/approved-vendors
// @access  Public (for event display)
const getApprovedVendorsForBazaar = async (req, res, next) => {
  try {
    const { bazaarId } = req.params;

    // Get all approved bazaar applications for this bazaar
    const approvedApplications = await BazaarApplication.find({
      bazaar: bazaarId,
      status: 'approved'
    }).populate('vendor', 'companyName logo');

    // Extract vendor information
    const vendors = approvedApplications.map(app => ({
      _id: app.vendor._id,
      companyName: app.vendor.companyName,
      logo: app.vendor.logo
    }));

    res.status(200).json({
      success: true,
      data: vendors,
      count: vendors.length
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to check booth availability for specific dates and location
const checkBoothAvailability = async (startDate, endDate, location) => {
  try {
    const requestedStartDate = new Date(startDate);
    const requestedEndDate = new Date(endDate);

    if (requestedEndDate <= requestedStartDate) {
      throw new Error("End date must be after start date");
    }

    const conflictingApplications = await BoothApplication.find({
      status: { $in: ["approved", "confirmed"] },
      location: location,
      startDate: { $lt: requestedEndDate },
      endDate: { $gt: requestedStartDate },
    });

    return {
      isAvailable: conflictingApplications.length === 0,
      conflicts: conflictingApplications,
      conflictCount: conflictingApplications.length,
    };
  } catch (error) {
    throw error;
  }
};

// @desc    Get booth conflicts for a time period
// @route   POST /api/applications/booth-conflicts
// @access  Private (Vendor)
const getBoothConflicts = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const requestedStartDate = new Date(startDate);
    const requestedEndDate = new Date(endDate);

    if (requestedEndDate <= requestedStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    const conflictingApplications = await BoothApplication.find({
      status: { $in: ["approved", "confirmed"] },
      startDate: { $lt: requestedEndDate },
      endDate: { $gt: requestedStartDate },
    });

    const occupiedLocations = [
      ...new Set(conflictingApplications.map((app) => app.location)),
    ];

    res.status(200).json({
      success: true,
      data: {
        occupiedBooths: occupiedLocations,
        conflictCount: occupiedLocations.length,
        totalConflicts: conflictingApplications.length,
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

// @desc    Update booth application dates
// @route   PUT /api/applications/booth/:applicationId
// @access  Private (Vendor)
const updateBoothApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { startDate, endDate, location, boothSize, attendees } = req.body;
    const vendorId = req.user._id;

    // Find the application and ensure it belongs to the vendor
    const application = await BoothApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Booth application not found.",
      });
    }

    if (application.vendor.toString() !== vendorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own applications.",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "You can only update pending applications.",
      });
    }

    // If location is being changed, check availability
    if (location && location !== application.location) {
      const availabilityCheck = await checkBoothAvailability(startDate || application.startDate, endDate || application.endDate, location);
      if (!availabilityCheck.isAvailable) {
        return res.status(409).json({
          success: false,
          message: `The booth location ${location} is already occupied during the requested period.`,
          data: {
            conflicts: availabilityCheck.conflicts,
            conflictCount: availabilityCheck.conflictCount
          }
        });
      }
    }

    // If dates are being changed, check availability for the current location
    if ((startDate || endDate) && (!location || location === application.location)) {
      const checkLocation = location || application.location;
      const checkStartDate = startDate || application.startDate;
      const checkEndDate = endDate || application.endDate;
      
      const availabilityCheck = await checkBoothAvailability(checkStartDate, checkEndDate, checkLocation);
      // Filter out the current application from conflicts (allow updating the same application)
      const otherConflicts = availabilityCheck.conflicts.filter(conflict => conflict._id.toString() !== applicationId);
      
      if (otherConflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: `The booth location ${checkLocation} is already occupied by other vendors during the requested period.`,
          data: {
            conflicts: otherConflicts,
            conflictCount: otherConflicts.length
          }
        });
      }
    }

    // Update the application
    const updateData = {};
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (location) updateData.location = location;
    if (boothSize) updateData.boothSize = boothSize;
    if (attendees) updateData.attendees = attendees;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      updateData.durationWeeks = diffWeeks;
    }

    const updatedApplication = await BoothApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Booth application updated successfully.",
      data: updatedApplication,
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
  getApprovedVendorsForBazaar,
  getBoothConflicts,
  updateApplicationStatus,
  updateBoothApplication,
};
