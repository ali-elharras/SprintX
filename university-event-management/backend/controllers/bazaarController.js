const Event = require("../models/Event");

// ================================
// @desc    Create a new bazaar
// @route   POST /api/bazaars
// @access  Private (Events Office)
// ================================
exports.createBazaar = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      registrationDeadline,
      maxParticipants,
      venue,
      tags,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !location ||
      !registrationDeadline ||
      !maxParticipants
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create bazaar event
    const newBazaar = await Event.create({
      title,
      description,
      type: "bazaar",
      startDate,
      endDate,
      location,
      venue,
      registrationRequired: true,
      registrationDeadline,
      maxParticipants,
      tags,
      organizer: req.user.id, // 👈 required in schema
      status: "published",
    });

    res.status(201).json({
      success: true,
      message: "Bazaar created successfully",
      data: newBazaar,
    });
  } catch (error) {
    console.error("❌ Error creating bazaar:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating bazaar",
      error: error.message,
    });
  }
};


// ================================
// @desc    Update bazaar details (only if it hasn’t started yet)
// @route   PUT /api/bazaars/:id
// @access  Private (Events Office)
// ================================
exports.updateBazaar = async (req, res) => {
  try {
    const bazaar = await Event.findById(req.params.id);

    if (!bazaar) {
      return res.status(404).json({ success: false, message: "Bazaar not found" });
    }

    if (bazaar.type !== "bazaar") {
      return res.status(400).json({ success: false, message: "This event is not a bazaar" });
    }

    const now = new Date();
    if (bazaar.startDate <= now) {
      return res.status(400).json({
        success: false,
        message: "You cannot edit a bazaar that has already started",
      });
    }

    const updatableFields = [
      "title",
      "description",
      "startDate",
      "endDate",
      "location",
      "registrationDeadline",
      "maxParticipants",
      "tags",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        bazaar[field] = req.body[field];
      }
    });

    await bazaar.save();

    res.status(200).json({
      success: true,
      message: "Bazaar updated successfully",
      data: bazaar,
    });
  } catch (error) {
    console.error("❌ Error updating bazaar:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating bazaar",
      error: error.message,
    });
  }
};

// ================================
// @desc    Get all bazaars
// @route   GET /api/bazaars
// @access  Public
// ================================
exports.getAllBazaars = async (req, res) => {
  try {
    const BazaarApplication = require("../models/BazaarApplication");
    
    const bazaars = await Event.find({ type: "bazaar" })
      .populate("organizer", "firstName lastName email role");

    // Calculate current participants (approved vendors) for each bazaar
    const bazaarsWithCounts = await Promise.all(
      bazaars.map(async (bazaar) => {
        const approvedVendorsCount = await BazaarApplication.countDocuments({
          bazaar: bazaar._id,
          status: "approved"
        });
        
        const bazaarObj = bazaar.toObject();
        bazaarObj.currentParticipants = approvedVendorsCount;
        return bazaarObj;
      })
    );

    res.status(200).json({
      success: true,
      count: bazaarsWithCounts.length,
      data: bazaarsWithCounts,
    });
  } catch (error) {
    console.error("❌ Error fetching bazaars:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bazaars",
      error: error.message,
    });
  }
};

// ================================
// @desc    Get single bazaar by ID
// @route   GET /api/bazaars/:id
// @access  Public
// ================================
exports.getBazaarById = async (req, res) => {
  try {
    const BazaarApplication = require("../models/BazaarApplication");
    
    const bazaar = await Event.findOne({ _id: req.params.id, type: "bazaar" })
      .populate("organizer", "firstName lastName email role");

    if (!bazaar) {
      return res.status(404).json({ success: false, message: "Bazaar not found" });
    }

    // Calculate current participants (approved vendors)
    const approvedVendorsCount = await BazaarApplication.countDocuments({
      bazaar: bazaar._id,
      status: "approved"
    });
    
    const bazaarObj = bazaar.toObject();
    bazaarObj.currentParticipants = approvedVendorsCount;

    res.status(200).json({
      success: true,
      data: bazaarObj,
    });
  } catch (error) {
    console.error("❌ Error fetching bazaar by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bazaar",
      error: error.message,
    });
  }
};

// ================================
// @desc    Delete a bazaar (only if it hasn’t started yet)
// @route   DELETE /api/bazaars/:id
// @access  Private (Events Office)
// ================================
exports.deleteBazaar = async (req, res) => {
  try {
    const bazaar = await Event.findById(req.params.id);

    if (!bazaar) {
      return res.status(404).json({ success: false, message: "Bazaar not found" });
    }

    if (bazaar.type !== "bazaar") {
      return res.status(400).json({ success: false, message: "This event is not a bazaar" });
    }

    const now = new Date();
    if (bazaar.startDate <= now) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete a bazaar that has already started",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Bazaar deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("❌ Error deleting bazaar:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting bazaar",
      error: error.message,
    });
  }
};
