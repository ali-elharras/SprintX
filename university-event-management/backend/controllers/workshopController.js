const Workshop = require('../models/Workshop');
const Event = require('../models/Event');
const User = require('../models/User');
const { createNotification, notifyAllUsersAboutNewEvent } = require('./notificationController');

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
        
        // Check for duplicate workshop name on creation
        const existingWorkshop = await Workshop.findOne({ 
            workshopName: workshopData.workshopName 
        });
        if (existingWorkshop) {
            return res.status(400).json({ 
                message: 'A workshop with this name already exists', 
                error: 'Duplicate workshop name' 
            });
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
        
        // Create notification for Events Office: "Professor [NAME] uploaded a workshop and it is waiting for approval."
        if (req.user && populatedWorkshop.createdBy) {
            try {
                // Find all Events Office users
                const eventsOfficeUsers = await User.find({ role: 'events_office' });
                const professorName = `${populatedWorkshop.createdBy.firstName} ${populatedWorkshop.createdBy.lastName}`;
                
                // Create notification for each Events Office user
                for (const eventsOfficeUser of eventsOfficeUsers) {
                    await createNotification(
                        eventsOfficeUser._id,
                        `Professor ${professorName} uploaded a workshop and it is waiting for approval.`,
                        'professor_workshop_submitted',
                        savedWorkshop._id,
                        savedWorkshop.workshopName,
                        { 
                            professorName,
                            professorId: populatedWorkshop.createdBy._id,
                            status: 'pending' 
                        }
                    );
                }
            } catch (notifError) {
                console.error('Error creating Events Office notification:', notifError);
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
        console.log(`[UPDATE WORKSHOP] Request from user ${req.user._id} (${req.user.role}) to update workshop ${workshopId}`);
        console.log('[UPDATE WORKSHOP] Update payload:', JSON.stringify(req.body, null, 2));
        
        const workshop = await Workshop.findById(workshopId);
        
        if (!workshop) {
            console.log(`[UPDATE WORKSHOP] Workshop ${workshopId} not found`);
            return res.status(404).json({ message: 'Workshop not found' });
        }
        
        // Authorization check: Only the creator or admin/events_office can update
        // Handle both populated and non-populated createdBy field
        const creatorId = workshop.createdBy?._id || workshop.createdBy;
        const isCreator = creatorId && creatorId.toString() === req.user._id.toString();
        const isAdminOrEventsOffice = req.user.role === 'admin' || req.user.role === 'events_office';
        
        if (!isCreator && !isAdminOrEventsOffice) {
            console.log(`Authorization failed: User ${req.user._id} (${req.user.role}) tried to edit workshop ${workshopId} created by ${creatorId}`);
            return res.status(403).json({ 
                message: 'Access denied. You can only edit workshops you created.' 
            });
        }
        
        // Professors can only edit workshops that are NOT published
        if (workshop.status === 'published' && !isAdminOrEventsOffice) {
            console.log(`Cannot edit published workshop: User ${req.user._id} tried to edit published workshop ${workshopId}`);
            return res.status(403).json({ 
                message: 'Cannot edit a published workshop. Please contact Events Office.' 
            });
        }
        
        // If the workshop name is being changed, check for duplicates
        if (req.body.workshopName && req.body.workshopName !== workshop.workshopName) {
            const existingWorkshop = await Workshop.findOne({ 
                workshopName: req.body.workshopName 
            });
            if (existingWorkshop) {
                return res.status(400).json({ 
                    message: 'A workshop with this name already exists', 
                    error: 'Duplicate workshop name' 
                });
            }
        }
        
        // Check if status is being changed to rejected
        const isBeingRejected = req.body.status === 'rejected' && workshop.status !== 'rejected';
        
        // Check if workshop is being resubmitted (status changing from needs_revision to pending)
        const isBeingResubmitted = workshop.status === 'needs_revision' && 
                                     (req.body.status === 'pending' || !req.body.status);
        
        // For partial updates, don't run full schema validators to allow partial updates
        // Only check critical validations manually
        if (req.body.endDate && req.body.startDate) {
            const startDate = new Date(req.body.startDate || workshop.startDate);
            const endDate = new Date(req.body.endDate);
            if (endDate <= startDate) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: ['End date and time must be after the start date and time']
                });
            }
        }
        
        const updatedWorkshop = await Workshop.findByIdAndUpdate(
            workshopId, 
            req.body, 
            { new: true, runValidators: false } // Don't run validators for partial updates
        ).populate('createdBy', 'firstName lastName email');
        
        console.log(`[UPDATE WORKSHOP] Successfully updated workshop ${workshopId}`);
        
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
                // Notification for professor
                await createNotification(
                    workshop.createdBy._id,
                    `Workshop "${workshop.workshopName}" resubmitted and waiting for approval.`,
                    'workshop_submitted',
                    workshop._id,
                    workshop.workshopName,
                    { status: 'pending', isResubmission: true }
                );
                
                // Notification for Events Office: "Professor [NAME] edited the workshop based on your requested changes."
                const eventsOfficeUsers = await User.find({ role: 'events_office' });
                const professorName = `${workshop.createdBy.firstName} ${workshop.createdBy.lastName}`;
                
                for (const eventsOfficeUser of eventsOfficeUsers) {
                    await createNotification(
                        eventsOfficeUser._id,
                        `Professor ${professorName} edited the workshop based on your requested changes.`,
                        'professor_workshop_edited',
                        workshop._id,
                        workshop.workshopName,
                        { 
                            professorName,
                            professorId: workshop.createdBy._id,
                            isResubmission: true 
                        }
                    );
                }
            } catch (notifError) {
                console.error('Error creating resubmission notification:', notifError);
            }
        }

        res.status(200).json(updatedWorkshop);
    } catch (error) {
        console.error('[UPDATE WORKSHOP] Error:', error);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors,
                error: error.message 
            });
        }
        
        // Handle duplicate key errors (e.g., unique constraint on workshopName)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                message: `A workshop with this ${field} already exists`, 
                error: error.message 
            });
        }
        
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

        // Check if workshop was published and has an associated Event
        if (workshop.publishedEventId) {
            // Check if there are any registrations for this workshop's published event
            const Registration = require('../models/Registration');
            const registrationCount = await Registration.countDocuments({ 
                event: workshop.publishedEventId,
                status: { $in: ['confirmed', 'pending', 'attended'] } // Only count active registrations
            });

            if (registrationCount > 0) {
                return res.status(400).json({ 
                    message: 'Cannot delete workshop - students have already registered',
                    registrationCount: registrationCount
                });
            }

            // No registrations, safe to delete the associated Event
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

// DELETE /api/workshops/by-event/:eventId - Delete a published workshop by its Event ID
exports.deleteWorkshopByEventId = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        
        // Find the workshop that has this eventId as its publishedEventId
        const workshop = await Workshop.findOne({ publishedEventId: eventId });

        if (!workshop) {
            return res.status(404).json({ message: 'Workshop not found for this event' });
        }

        // Check if there are any registrations for this event
        const Registration = require('../models/Registration');
        const registrationCount = await Registration.countDocuments({ 
            event: eventId,
            status: { $in: ['confirmed', 'pending', 'attended'] }
        });

        if (registrationCount > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete workshop - students have already registered',
                registrationCount: registrationCount
            });
        }

        // No registrations, safe to delete both the Event and Workshop
        try {
            await Event.findByIdAndDelete(eventId);
            console.log(`✅ Deleted Event with ID: ${eventId}`);
        } catch (eventError) {
            console.error('Error deleting event:', eventError);
            // Continue with workshop deletion even if event deletion fails
        }

        // Delete the workshop
        await Workshop.findByIdAndDelete(workshop._id);
        console.log(`✅ Deleted Workshop with ID: ${workshop._id}`);

        res.status(200).json({ 
            message: 'Workshop successfully deleted',
            deletedWorkshopId: workshop._id,
            deletedEventId: eventId
        });
    } catch (error) {
        console.error('Error deleting workshop by event ID:', error);
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
        
        // Store workshop details before deletion for notification
        const workshopName = workshop.workshopName;
        const creatorId = workshop.createdBy?._id;
        
        // Create notification for professor about rejection BEFORE deleting
        if (creatorId) {
            try {
                const rejectionMessage = reason 
                    ? `Your workshop "${workshopName}" has been rejected and removed. Reason: ${reason}`
                    : `Your workshop "${workshopName}" has been rejected and removed by Events Office.`;
                
                await createNotification(
                    creatorId,
                    rejectionMessage,
                    'workshop_rejected',
                    workshop._id,
                    workshopName,
                    { reason: reason || 'No reason provided', rejectedBy: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Events Office' }
                );
            } catch (notifError) {
                console.error('Error creating rejection notification:', notifError);
                // Continue with deletion even if notification fails
            }
        }
        
        // Delete the workshop from the database
        await Workshop.findByIdAndDelete(workshopId);
        
        res.status(200).json({
            success: true,
            message: 'Workshop rejected and deleted successfully',
            workshopName: workshopName
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

        // Check if workshop is already published and has an event
        if (workshop.status === 'published' && workshop.publishedEventId) {
            // Return the existing event instead of creating a duplicate
            try {
                const existingEvent = await Event.findById(workshop.publishedEventId).populate("organizer", "firstName lastName email");
                if (existingEvent) {
                    console.log('Workshop already published with existing Event ID:', workshop.publishedEventId);
                    return res.status(200).json({ 
                        success: true,
                        message: `Workshop "${workshop.workshopName}" is already published!`, 
                        event: existingEvent.toObject({ virtuals: true }) 
                    });
                }
                // If event was deleted but workshop still marked as published, continue to create new event
                console.log('Published event not found, creating new event for already-published workshop');
            } catch (err) {
                console.error('Error checking existing event:', err);
            }
        } else if (workshop.status === 'published') {
            // Workshop is marked as published but has no event ID - should not normally happen
            console.warn('Workshop marked as published but missing publishedEventId');
        }

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
        
        // Notify all users about the new event
        try {
            await notifyAllUsersAboutNewEvent(workshop.workshopName, createdEvent._id);
        } catch (notifError) {
            console.error('Error notifying users about new event:', notifError);
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