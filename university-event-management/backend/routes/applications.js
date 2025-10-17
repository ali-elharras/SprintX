const express = require("express");
const { 
    applyToBazaar, 
    applyForBooth, 
    getMyParticipations, 
    getMyRequests,
    getMyBazaarApplication,
    getAllApplications, 
    getApprovedVendorsForBazaar,
    getBoothConflicts,
    updateApplicationStatus 
} = require("../controllers/applicationController");
const { protect, requireVendor, requireApprovedVendor, requireAdminOrEventsOffice } = require("../middleware/auth");

const router = express.Router();

// Public route for getting approved vendors for a bazaar (for event display)
// This must come BEFORE the /:bazaarId route to avoid conflicts
router.get("/bazaar/:bazaarId/approved-vendors", getApprovedVendorsForBazaar);

// Vendor routes
router.get("/bazaar/:bazaarId", [protect, requireVendor], getMyBazaarApplication);
router.post("/bazaar/:bazaarId", [protect, requireVendor], applyToBazaar);
router.post("/booth", [protect, requireVendor], applyForBooth);
router.post("/booth-conflicts", [protect, requireVendor], getBoothConflicts);
router.get("/my-participations", [protect, requireVendor], getMyParticipations);
router.get("/my-requests", [protect, requireVendor], getMyRequests);

// Admin/Events Office routes
router.get("/", [protect, requireAdminOrEventsOffice], getAllApplications);
router.put("/:applicationType/:applicationId/status", [protect, requireAdminOrEventsOffice], updateApplicationStatus);

module.exports = router;