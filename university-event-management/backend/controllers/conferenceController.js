// File: /university-event-management/university-event-management/backend/controllers/conferenceController.js

const Conference = require("../models/Conference.js") ;

// Create a new conference
const createConference = async (req, res) => {
    try {
        const conference = new Conference(req.body);
        await conference.save();
        res.status(201).json({ success: true, data: conference });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Edit an existing conference
const editConference = async (req, res) => {
    try {
        const { id } = req.params;
        const conference = await findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!conference) {
            return res.status(404).json({ success: false, message: 'Conference not found' });
        }
        res.status(200).json({ success: true, data: conference });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a conference
const deleteConference = async (req, res) => {
    try {
        const conference = await Conference.findById(req.params.id);
        if (!conference) {
            return res.status(404).json({ success: false, message: 'Conference not found' });
        }
        // Check if user has permission to delete (Events Office or Admin)
        if (req.user.role !== 'events_office' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: "You don't have permission to delete conferences"
        });
        }
        // Check if conference has any registrations
        if (conference.registrations && conference.registrations.length > 0) {
        return res.status(400).json({
            success: false,
            error: "Cannot delete conference with existing registrations"
        });
        }
        // Soft delete the conference
        await Conference.findByIdAndUpdate(req.params.id, {
        isDeleted: true
        });

        res.status(200).json({
        success: true,
        message: "Conference deleted successfully"
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all conferences
const getConferences = async (req, res) => {
    try {
        const conferences = await find();
        res.status(200).json({ success: true, data: conferences });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = {
    createConference,
    editConference,
    deleteConference,
    getConferences,
};