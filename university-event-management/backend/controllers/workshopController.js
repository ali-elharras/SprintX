const Workshop = require('../models/Workshop');
const Event = require('../models/Event');
const User = require('../models/User');

// GET /api/workshops - Fetch all workshops (READ)
// Optional query: ?status=pending|published
exports.getAllWorkshops = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        // Find all, sort by startDate ascending
        const workshops = await Workshop.find(query).sort({ startDate: 1 });
        res.status(200).json(workshops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching workshops', error: error.message });
    }
};

// POST /api/workshops - Create a new workshop (CREATE)
exports.createWorkshop = async (req, res) => {
    try {
        // Workshops created by professors should default to pending (schema default)
        const newWorkshop = new Workshop({ ...req.body });
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

// POST /api/workshops/:id/publish - Publish a pending workshop as an Event (Admin/Events Office)
exports.publishWorkshop = async (req, res) => {
    try {
        console.log('Publishing workshop. User:', req.user ? `${req.user.firstName} ${req.user.lastName} (${req.user.role})` : 'No user in request');
        
        const workshopId = req.params.id;
        const workshop = await Workshop.findById(workshopId);
        if (!workshop) return res.status(404).json({ success: false, message: 'Workshop not found' });

        if (workshop.status === 'published') return res.status(400).json({ message: 'Workshop already published' });

        // Create a new Event using the same fields/mapping expected by Event model
        // Map workshop fields to event fields
        // Need an organizer - use the authenticated user who is publishing the workshop (Events Office user)
        let organizerId = req.user?.id;
        
        // If for some reason user ID is not in the request (shouldn't happen with proper auth)
        if (!organizerId) {
            // Fallback to finding any events_office user
            const sysUser = await User.findOne({ role: 'events_office' });
            
            if (!sysUser) {
                // If we can't find any events_office user as fallback
                return res.status(400).json({ 
                    success: false, 
                    message: 'Could not determine event organizer. Please try again while logged in as Events Office.' 
                });
            }
            
            organizerId = sysUser._id;
        }

        // Ensure we have all required fields for the Event model
        const eventPayload = {
            name: workshop.workshopName, // Map from Workshop model field to Event model field
            title: workshop.workshopName,
            description: workshop.shortDescription || workshop.fullAgenda,
            type: 'workshop',
            startDate: workshop.startDate,
            endDate: workshop.endDate,
            location: workshop.location,
            venue: workshop.location,
            registrationRequired: true,
            registrationDeadline: workshop.registrationDeadline,
            maxParticipants: workshop.capacity || 30, // Provide default if missing
            currentParticipants: 0,
            eligibleRoles: ['student','staff','ta','professor'],
            organizer: organizerId,
            organizerDetails: { name: 'Events Office' }, // Always provide organizer details
            status: 'published',
            prerequisites: workshop.extraRequiredResources || '',
            materials: '',
            cost: workshop.requiredBudget || 0,
            tags: [workshop.facultyResponsible || 'Academic'], // Use faculty as a tag
            images: [],
            instructor: workshop.professorsParticipating ? 
                        (Array.isArray(workshop.professorsParticipating) ? 
                            workshop.professorsParticipating.join(', ') : 
                            workshop.professorsParticipating) : 
                        'University Faculty',
            duration: 2, // Default duration in hours if not specified
        };

        const createdEvent = await Event.create(eventPayload);

        // Link back to workshop
        workshop.status = 'published';
        workshop.publishedEventId = createdEvent._id;
        await workshop.save();

        // Populate organizer for the returned object and convert to plain object including virtuals
        const populated = await Event.findById(createdEvent._id).populate("organizer", "firstName lastName email");
        const eventObj = populated.toObject({ virtuals: true });

        console.log('Created event object to return:', eventObj);

        res.status(200).json({ 
            success: true,
            message: `Workshop "${workshop.workshopName}" successfully published as an event!`, 
            event: eventObj 
        });
    } catch (error) {
        console.error('Error publishing workshop:', error);
        res.status(500).json({ success: false, message: 'Error publishing workshop: ' + error.message });
    }
};