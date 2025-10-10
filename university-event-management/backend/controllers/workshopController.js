const Workshop = require('../models/Workshop');

// GET /api/workshops - Fetch all workshops (READ)
exports.getAllWorkshops = async (req, res) => {
    try {
        // Find all, sort by startDate ascending
        const workshops = await Workshop.find().sort({ startDate: 1 });
        res.status(200).json(workshops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching workshops', error: error.message });
    }
};

// POST /api/workshops - Create a new workshop (CREATE)
exports.createWorkshop = async (req, res) => {
    try {
        const newWorkshop = new Workshop(req.body);
        const savedWorkshop = await newWorkshop.save();
        res.status(201).json(savedWorkshop);
    } catch (error) {
        // Handle validation errors (e.g., required fields missing)
        res.status(400).json({ message: 'Error creating workshop', error: error.message });
    }
};

// PATCH /api/workshops/:id - Update an existing workshop (UPDATE)
exports.updateWorkshop = async (req, res) => {
    try {
        const workshopId = req.params.id;
        const updatedWorkshop = await Workshop.findByIdAndUpdate(
            workshopId, 
            req.body, 
            { new: true, runValidators: true } // Return new doc, run validation
        );

        if (!updatedWorkshop) {
            return res.status(404).json({ message: 'Workshop not found' });
        }

        res.status(200).json(updatedWorkshop);
    } catch (error) {
        res.status(400).json({ message: 'Error updating workshop', error: error.message });
    }
};

// DELETE /api/workshops/:id - Delete a workshop (DELETE - Optional)
exports.deleteWorkshop = async (req, res) => {
    try {
        const workshopId = req.params.id;
        const result = await Workshop.findByIdAndDelete(workshopId);

        if (!result) {
            return res.status(404).json({ message: 'Workshop not found' });
        }

        res.status(200).json({ message: 'Workshop successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting workshop', error: error.message });
    }
};