const Event = require("../models/Event");

// Get all conferences
const getConferences = async (req, res) => {
    try {
        const conferences = await Event.find({ type: "conference" }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: conferences
        });
    } catch (error) {
        console.error('Error fetching conferences:', error);
        res.status(400).json({
            success: false,
            message: 'Error fetching conferences',
            error: error.message
        });
    }
};

// Get a single conference by ID
const getConference = async (req, res) => {
    try {
        const conference = await Event.findOne({ 
            _id: req.params.id, 
            type: "conference" 
        });
        
        if (!conference) {
            return res.status(404).json({
                success: false,
                message: 'Conference not found'
            });
        }

        res.status(200).json({
            success: true,
            data: conference
        });
    } catch (error) {
        console.error('Error fetching conference:', error);
        res.status(400).json({
            success: false,
            message: 'Error fetching conference',
            error: error.message
        });
    }
};

// Create a new conference
const createConference = async (req, res) => {
    try {
        const {
            name,
            startDate,
            endDate,
            shortDescription,
            fullAgenda,
            websiteLink,
            requiredBudget,
            sourceOfFunding,
            extraRequiredResources,
            location,
            maxParticipants
        } = req.body;

        // Validate required fields
        if (!name || !startDate || !endDate || !shortDescription || !location || !maxParticipants || !sourceOfFunding) {
            return res.status(400).json({
                success: false,
                message: 'All required fields are missing: name, startDate, endDate, shortDescription, location, maxParticipants, sourceOfFunding'
            });
        }

        const conference = new Event({
            title: name,
            name: name, // For consistency
            description: shortDescription,
            shortDescription,
            fullAgenda: fullAgenda || '',
            websiteLink: websiteLink || '',
            requiredBudget: parseFloat(requiredBudget) || 0,
            sourceOfFunding,
            extraRequiredResources: extraRequiredResources || '',
            type: "conference",
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            location,
            maxParticipants: parseInt(maxParticipants),
            currentParticipants: 0,
            registrationRequired: true,
            registrationDeadline: new Date(endDate), // Set to end date by default
            status: "published",
            cost: 0, // Default for conferences
            organizer: req.user?._id || null,
        });

        const savedConference = await conference.save();
        
        res.status(201).json({
            success: true,
            message: 'Conference created successfully',
            data: savedConference
        });
    } catch (error) {
        console.error('Conference creation error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create conference',
            error: error.message
        });
    }
};

// Edit an existing conference
const editConference = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { 
            ...req.body,
            title: req.body.name || req.body.title,
            name: req.body.name,
            description: req.body.shortDescription || req.body.description,
            shortDescription: req.body.shortDescription,
        };
        
        // Convert date fields if provided
        if (updateData.startDate) {
            updateData.startDate = new Date(updateData.startDate);
        }
        if (updateData.endDate) {
            updateData.endDate = new Date(updateData.endDate);
            updateData.registrationDeadline = new Date(updateData.endDate); // Update deadline
        }

        // Convert numeric fields if provided
        if (updateData.requiredBudget !== undefined) {
            updateData.requiredBudget = parseFloat(updateData.requiredBudget);
        }
        if (updateData.maxParticipants !== undefined) {
            updateData.maxParticipants = parseInt(updateData.maxParticipants);
        }

        const conference = await Event.findOneAndUpdate(
            { _id: id, type: "conference" },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (!conference) {
            return res.status(404).json({
                success: false,
                message: 'Conference not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Conference updated successfully',
            data: conference
        });
    } catch (error) {
        console.error('Error updating conference:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update conference',
            error: error.message
        });
    }
};

// Delete a conference
const deleteConference = async (req, res) => {
  try {
    const conference = await Event.findOne({ 
        _id: req.params.id, 
        type: "conference" 
    });
    
    if (!conference) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conference not found' 
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Conference deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting conference:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete conference',
      error: error.message 
    });
  }
};

module.exports = {
    getConferences,
    createConference,
    editConference,
    deleteConference,
    getConference,
};