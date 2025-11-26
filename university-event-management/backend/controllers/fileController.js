const BazaarApplication = require("../models/BazaarApplication");
const BoothApplication = require("../models/BoothApplication");
const Vendor = require("../models/Vendor");

// @desc    Get all uploaded files from applications
// @route   GET /api/files/uploads
// @access  Private (Admin/Events Office only)
const getUploadedFiles = async (req, res, next) => {
  try {
    const allFiles = [];

    // 1. Fetch all vendors with tax cards and logos
    const vendors = await Vendor.find({
      $or: [
        { taxCardUrl: { $exists: true, $ne: null, $ne: "" } },
        { logoUrl: { $exists: true, $ne: null, $ne: "" } }
      ]
    }).select("companyName email taxCardUrl logoUrl createdAt");

    // Extract vendor registration files
    vendors.forEach((vendor) => {
      if (vendor.taxCardUrl) {
        allFiles.push({
          name: `${vendor.companyName}_Tax_Card`,
          url: vendor.taxCardUrl,
          uploadedAt: vendor.createdAt,
          uploadedBy: vendor.companyName,
          vendorEmail: vendor.email,
          category: "Vendor Registration",
          fileType: "Tax Card",
          type: "vendor_tax_card",
          size: null,
        });
      }
      if (vendor.logoUrl) {
        allFiles.push({
          name: `${vendor.companyName}_Logo`,
          url: vendor.logoUrl,
          uploadedAt: vendor.createdAt,
          uploadedBy: vendor.companyName,
          vendorEmail: vendor.email,
          category: "Vendor Registration",
          fileType: "Logo",
          type: "vendor_logo",
          size: null,
        });
      }
    });

    // 2. Fetch all bazaar applications with ID proof images
    const bazaarApplications = await BazaarApplication.find({
      "attendees.idProofImageUrl": { $exists: true, $ne: null, $ne: "" }
    })
      .populate("vendor", "companyName email")
      .populate("bazaar", "title startDate endDate")
      .select("attendees vendor bazaar createdAt");

    // Extract ID proofs from bazaar applications
    bazaarApplications.forEach((app) => {
      app.attendees.forEach((attendee) => {
        if (attendee.idProofImageUrl) {
          allFiles.push({
            name: `${attendee.name}_ID_Proof`,
            url: attendee.idProofImageUrl,
            uploadedAt: app.createdAt,
            uploadedBy: app.vendor?.companyName || "Unknown Vendor",
            vendorEmail: app.vendor?.email || "N/A",
            category: "Bazaar Application",
            fileType: "Attendee ID Proof",
            type: "bazaar_id_proof",
            eventName: app.bazaar?.title || "Unknown Bazaar",
            eventDates: app.bazaar ? `${new Date(app.bazaar.startDate).toLocaleDateString()} - ${new Date(app.bazaar.endDate).toLocaleDateString()}` : "N/A",
            attendeeName: attendee.name,
            attendeeEmail: attendee.email,
            size: null,
          });
        }
      });
    });

    // 3. Fetch all booth applications with ID proof images
    const boothApplications = await BoothApplication.find({
      "attendees.idProofImageUrl": { $exists: true, $ne: null, $ne: "" }
    })
      .populate("vendor", "companyName email")
      .select("attendees vendor location startDate endDate createdAt");

    // Extract ID proofs from booth applications
    boothApplications.forEach((app) => {
      app.attendees.forEach((attendee) => {
        if (attendee.idProofImageUrl) {
          allFiles.push({
            name: `${attendee.name}_ID_Proof`,
            url: attendee.idProofImageUrl,
            uploadedAt: app.createdAt,
            uploadedBy: app.vendor?.companyName || "Unknown Vendor",
            vendorEmail: app.vendor?.email || "N/A",
            category: "Booth Application",
            fileType: "Attendee ID Proof",
            type: "booth_id_proof",
            eventName: `Booth at ${app.location}`,
            eventDates: `${new Date(app.startDate).toLocaleDateString()} - ${new Date(app.endDate).toLocaleDateString()}`,
            attendeeName: attendee.name,
            attendeeEmail: attendee.email,
            size: null,
          });
        }
      });
    });

    // Sort by upload date (most recent first)
    allFiles.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.status(200).json({
      success: true,
      data: allFiles,
      count: allFiles.length,
      summary: {
        taxCards: allFiles.filter(f => f.type === "vendor_tax_card").length,
        logos: allFiles.filter(f => f.type === "vendor_logo").length,
        bazaarIdProofs: allFiles.filter(f => f.type === "bazaar_id_proof").length,
        boothIdProofs: allFiles.filter(f => f.type === "booth_id_proof").length,
      }
    });
  } catch (error) {
    console.error("Error fetching uploaded files:", error);
    next(error);
  }
};

module.exports = {
  getUploadedFiles,
};
