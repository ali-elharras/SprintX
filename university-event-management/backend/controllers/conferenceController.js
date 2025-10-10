const Conference = require("../models/Conference.js") ;

// Get a single conference by ID
const getConference = async (req, res) => {
    try {
        const conference = await Conference.findById(req.params.id);
        
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
        const { title, description, date, location, capacity } = req.body;

        // Validate required fields
        if (!title || !description || !date || !location || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: title, description, date, location, capacity'
            });
        }

        const conference = new Conference({
            title,
            description,
            date,
            location,
            capacity: parseInt(capacity)
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
        const conference = await Conference.findByIdAndUpdate(
            id,
            req.body,
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
    const conference = await Conference.findById(req.params.id);
    
    if (!conference) {
      return res.status(404).json({ 
        success: false, 
        message: 'Conference not found' 
      });
    }

    // User is already authorized by middleware, so we can proceed with deletion
    
    // Use hard delete (remove from database completely)
    await Conference.findByIdAndDelete(req.params.id);

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
    createConference,
    editConference,
    deleteConference,
    getConference,
};