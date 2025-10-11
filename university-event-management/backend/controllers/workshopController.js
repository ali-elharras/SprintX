const Workshop = require('../models/Workshop');
const Event = require('../models/Event');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// GET /api/workshops - Fetch all workshops (READ)
// Optional query: ?status=pending|published
exports.getAllWorkshops = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        
        // If status filter is provided, apply it
        if (status) query.status = status;

        // Role-based filtering
        if (req.user) {
            // Professors and Staff should see:
            // 1. Their own workshops (all statuses)
            // 2. Published workshops (visible to everyone)
            if (req.user.role === 'professor' || req.user.role === 'staff') {
                query.$or = [
                    { createdBy: req.user._id }, // Their own workshops
                    { status: 'published' }       // Published workshops
                ];
            }
            // Events Office and Admin can see all workshops
            // Students, TA can only see published workshops
            else if (!['admin', 'events_office'].includes(req.user.role)) {
                query.status = 'published';
            }
        } else {
            // Unauthenticated users only see published workshops
            query.status = 'published';
        }

        // Find all, sort by startDate ascending, populate creator info
        const workshops = await Workshop.find(query)
            .populate('createdBy', 'firstName lastName email role')
            .sort({ startDate: 1 });
        
        res.status(200).json(workshops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching workshops', error: error.message });
    }
};

// POST /api/workshops - Create a new workshop (CREATE)
exports.createWorkshop = async (req, res) => {
    try {
        // Workshops created by professors should default to pending (schema default)
        const workshopData = { ...req.body };
        
        // If user is authenticated, capture the creator's ID
        if (req.user && req.user._id) {
            workshopData.createdBy = req.user._id;
        }
        
        const newWorkshop = new Workshop(workshopData);
        const savedWorkshop = await newWorkshop.save();
        
        // Populate the createdBy field with user details
        const populatedWorkshop = await Workshop.findById(savedWorkshop._id)
            .populate('createdBy', 'firstName lastName email role');
        
        // Create notification for professor: "Workshop added and waiting for approval"
        if (req.user && req.user._id) {
            try {
                await createNotification(
                    req.user._id,
                    `Workshop "${savedWorkshop.workshopName}" added and waiting for approval.`,
                    'workshop_submitted',
                    savedWorkshop._id,
                    savedWorkshop.workshopName,
                    { status: 'pending' }
                );
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
                // Don't fail the request if notification fails
            }
        }
        
        res.status(201).json(populatedWorkshop);
    } catch (error) {
        // Handle validation errors (e.g., required fields missing)
        res.status(400).json({ message: 'Error creating workshop', error: error.message });
    }
};

// PATCH /api/workshops/:id - Update an existing workshop (UPDATE)
exports.updateWorkshop = async (req, res) => {
    try {
        const workshopId = req.params.id;
        const workshop = await Workshop.findById(workshopId).populate('createdBy', 'firstName lastName email');
        
        if (!workshop) {
            return res.status(404).json({ message: 'Workshop not found' });
        }
        
        // Check if status is being changed to rejected
        const isBeingRejected = req.body.status === 'rejected' && workshop.status !== 'rejected';
        
        // Check if workshop is being resubmitted (status changing from needs_revision to pending)
        const isBeingResubmitted = workshop.status === 'needs_revision' && 
                                     (req.body.status === 'pending' || !req.body.status);
        
        const updatedWorkshop = await Workshop.findByIdAndUpdate(
            workshopId, 
            req.body, 
            { new: true, runValidators: true } // Return new doc, run validation
        ).populate('createdBy', 'firstName lastName email');
        
        // Create rejection notification
        if (isBeingRejected && workshop.createdBy && workshop.createdBy._id) {
            try {
                await createNotification(
                    workshop.createdBy._id,
                    `Workshop "${workshop.workshopName}" got rejected.`,
                    'workshop_rejected',
                    workshop._id,
                    workshop.workshopName,
                    { previousStatus: workshop.status }
                );
            } catch (notifError) {
                console.error('Error creating rejection notification:', notifError);
            }
        }
        
        // Create resubmission notification (workshop waiting for approval again)
        if (isBeingResubmitted && workshop.createdBy && workshop.createdBy._id) {
            try {
                await createNotification(
                    workshop.createdBy._id,
                    `Workshop "${workshop.workshopName}" resubmitted and waiting for approval.`,
                    'workshop_submitted',
                    workshop._id,
                    workshop.workshopName,
                    { status: 'pending', isResubmission: true }
                );
            } catch (notifError) {
                console.error('Error creating resubmission notification:', notifError);
            }
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
        const workshop = await Workshop.findById(workshopId);

        if (!workshop) {
            return res.status(404).json({ message: 'Workshop not found' });
        }

        // If workshop was published, also delete the associated Event
        if (workshop.publishedEventId) {
            try {
                await Event.findByIdAndDelete(workshop.publishedEventId);
                console.log(`✅ Deleted associated Event with ID: ${workshop.publishedEventId}`);
            } catch (eventError) {
                console.error('Error deleting associated event:', eventError);
                // Continue with workshop deletion even if event deletion fails
            }
        }

        // Delete the workshop
        await Workshop.findByIdAndDelete(workshopId);

        res.status(200).json({ 
            message: 'Workshop successfully deleted',
            deletedEventId: workshop.publishedEventId || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting workshop', error: error.message });
    }
};

// POST /api/workshops/:id/request-edit - Request edits for a pending workshop (Admin/Events Office)
exports.requestEditWorkshop = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Edit request message is required' });
        }
        
        const workshopId = req.params.id;
        const workshop = await Workshop.findById(workshopId).populate('createdBy', 'firstName lastName email');
        
        if (!workshop) {
            return res.status(404).json({ success: false, message: 'Workshop not found' });
        }
        
        if (workshop.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot request edits for a published workshop' });
        }
        
        // Create an edit request entry
        const editRequest = {
            message,
            requestedBy: {
                id: req.user?.id,
                name: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Events Office'
            },
            requestedAt: new Date(),
            status: 'needs_revision'
        };
        
        // Add the edit request to the workshop and update status
        workshop.editRequests.push(editRequest);
        workshop.status = 'needs_revision';
        await workshop.save();
        
        // Create notification for professor about edit request
        if (workshop.createdBy && workshop.createdBy._id) {
            try {
                await createNotification(
                    workshop.createdBy._id,
                    `Edit is requested for workshop "${workshop.workshopName}": ${message}`,
                    'workshop_edit_requested',
                    workshop._id,
                    workshop.workshopName,
                    { editMessage: message, requestedBy: editRequest.requestedBy.name }
                );
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Edit request sent successfully',
            workshop
        });
    } catch (error) {
        console.error('Error requesting workshop edits:', error);
        res.status(500).json({ success: false, message: 'Error requesting workshop edits: ' + error.message });
    }
};

// POST /api/workshops/:id/reject - Reject a pending workshop (Admin/Events Office)
exports.rejectWorkshop = async (req, res) => {
    try {
        const { reason } = req.body;
        
        const workshopId = req.params.id;
        const workshop = await Workshop.findById(workshopId).populate('createdBy', 'firstName lastName email');
        
        if (!workshop) {
            return res.status(404).json({ success: false, message: 'Workshop not found' });
        }
        
        if (workshop.status === 'published') {
            return res.status(400).json({ success: false, message: 'Cannot reject a published workshop' });
        }
        
        // Update workshop status to rejected
        workshop.status = 'rejected';
        await workshop.save();
        
        // Create notification for professor about rejection
        if (workshop.createdBy && workshop.createdBy._id) {
            try {
                const rejectionMessage = reason 
                    ? `Your workshop "${workshop.workshopName}" has been rejected. Reason: ${reason}`
                    : `Your workshop "${workshop.workshopName}" has been rejected by Events Office.`;
                
                await createNotification(
                    workshop.createdBy._id,
                    rejectionMessage,
                    'workshop_rejected',
                    workshop._id,
                    workshop.workshopName,
                    { reason: reason || 'No reason provided', rejectedBy: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Events Office' }
                );
            } catch (notifError) {
                console.error('Error creating rejection notification:', notifError);
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Workshop rejected successfully',
            workshop
        });
    } catch (error) {
        console.error('Error rejecting workshop:', error);
        res.status(500).json({ success: false, message: 'Error rejecting workshop: ' + error.message });
    }
};

// POST /api/workshops/:id/publish - Publish a pending workshop as an Event (Admin/Events Office)
exports.publishWorkshop = async (req, res) => {
    try {
        console.log('Publishing workshop. User:', req.user ? `${req.user.firstName} ${req.user.lastName} (${req.user.role})` : 'No user in request');
        
        const workshopId = req.params.id;
        const workshop = await Workshop.findById(workshopId).populate('createdBy', 'firstName lastName email');
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

        // Create notification for professor: Workshop published
        if (workshop.createdBy && workshop.createdBy._id) {
            try {
                await createNotification(
                    workshop.createdBy._id,
                    `Workshop "${workshop.workshopName}" has been published successfully!`,
                    'workshop_published',
                    workshop._id,
                    workshop.workshopName,
                    { eventId: createdEvent._id }
                );
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
            }
        }

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