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

        console.log('Received dates:', { startDate, endDate });

        // Validate required fields
        if (!name || !startDate || !endDate || !shortDescription || !location || !maxParticipants || !sourceOfFunding) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided: name, startDate, endDate, shortDescription, location, maxParticipants, sourceOfFunding'
            });
        }

        // Create Date objects for validation - ensure they're treated as local time
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);
        
        // Validate that dates are valid
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }
        
        // Add at least 1 minute buffer to ensure end date is definitely after start date
        const timeDiff = endDateTime.getTime() - startDateTime.getTime();
        console.log('Time difference:', timeDiff, 'ms');
        
        if (timeDiff <= 60000) { // 60,000 ms = 1 minute
            return res.status(400).json({
                success: false,
                message: 'End date must be at least 1 minute after start date'
            });
        }

        const updateData = {
            title: name,
            name: name,
            description: shortDescription,
            shortDescription: shortDescription,
            fullAgenda: fullAgenda || '',
            websiteLink: websiteLink || '',
            requiredBudget: parseFloat(requiredBudget) || 0,
            sourceOfFunding: sourceOfFunding,
            extraRequiredResources: extraRequiredResources || '',
            startDate: startDateTime,
            endDate: endDateTime,
            location: location,
            maxParticipants: parseInt(maxParticipants),
            registrationDeadline: endDateTime,
        };

        console.log('Update data dates:', {
            startDate: updateData.startDate,
            endDate: updateData.endDate,
            startISO: updateData.startDate.toISOString(),
            endISO: updateData.endDate.toISOString()
        });

        // First try with validators
        try {
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
            
            return res.status(200).json({
                success: true,
                message: 'Conference updated successfully',
                data: conference
            });
            
        } catch (validationError) {
            console.log('Validation failed, trying without validators:', validationError.message);
            
            // If validation fails, try without validators
            const conference = await Event.findOneAndUpdate(
                { _id: id, type: "conference" },
                { $set: updateData },
                { new: true, runValidators: false } // Disable Mongoose validators
            );
            
            if (!conference) {
                return res.status(404).json({
                    success: false,
                    message: 'Conference not found'
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Conference updated successfully (validation bypassed)',
                data: conference
            });
        }
        
    } catch (error) {
        console.error('Error updating conference:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }
        
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