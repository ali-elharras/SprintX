const Notification = require('../models/Notification');

// GET /api/notifications - Get all notifications for the logged-in user (professor, staff, or events_office)
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .populate('workshopId', 'workshopName status')
            .limit(50); // Limit to last 50 notifications

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message,
        });
    }
};

// GET /api/notifications/unread-count - Get unread notification count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.user._id);
        
        res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting unread count',
            error: error.message,
        });
    }
};

// PATCH /api/notifications/:id/read - Mark a notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read',
            error: error.message,
        });
    }
};

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.markAllAsRead(req.user._id);

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking all notifications as read',
            error: error.message,
        });
    }
};

// DELETE /api/notifications/:id - Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message,
        });
    }
};

// DELETE /api/notifications - Delete all notifications for the user
exports.deleteAllNotifications = async (req, res) => {
    try {
        const result = await Notification.deleteMany({ recipient: req.user._id });

        res.status(200).json({
            success: true,
            message: 'All notifications deleted successfully',
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting all notifications',
            error: error.message,
        });
    }
};

// Helper function to create notification (used by other controllers)
exports.createNotification = async (recipientId, message, type, workshopId = null, workshopName = null, metadata = {}) => {
    try {
        const notificationData = {
            recipient: recipientId,
            message,
            type,
            workshopId,
            workshopName,
            metadata,
        };
        
        // Add professorName if provided in metadata
        if (metadata.professorName) {
            notificationData.professorName = metadata.professorName;
        }
        
        // Add eventName and eventId if provided in metadata
        if (metadata.eventName) {
            notificationData.eventName = metadata.eventName;
        }
        if (metadata.eventId) {
            notificationData.eventId = metadata.eventId;
        }
        
        // Add vendorName if provided in metadata
        if (metadata.vendorName) {
            notificationData.vendorName = metadata.vendorName;
        }
        
        // Add promoCode if provided in metadata
        if (metadata.promoCode) {
            notificationData.promoCode = metadata.promoCode;
        }
        
        // Add discountRate if provided in metadata
        if (metadata.discountRate) {
            notificationData.discountRate = metadata.discountRate;
        }
        
        // Add vendorId if provided in metadata
        if (metadata.vendorId) {
            notificationData.vendorId = metadata.vendorId;
        }
        
        // Add applicationType if provided in metadata
        if (metadata.applicationType) {
            notificationData.applicationType = metadata.applicationType;
        }
        
        // Add applicationId if provided in metadata
        if (metadata.applicationId) {
            notificationData.applicationId = metadata.applicationId;
        }
        
        const notification = await Notification.createNotification(notificationData);
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Helper function to notify all stakeholders about a new event
exports.notifyAllUsersAboutNewEvent = async (eventName, eventId) => {
    try {
        const User = require('../models/User');
        
        // Find all users with roles: student, staff, ta, events_office, professor
        const stakeholders = await User.find({ 
            role: { $in: ['student', 'staff', 'ta', 'events_office', 'professor'] } 
        });
        
        console.log(`Creating notifications for ${stakeholders.length} users about new event: ${eventName}`);
        
        // Create notification for each stakeholder only if they don't already have one for this event
        const notificationPromises = stakeholders.map(async (user) => {
            // Check if notification already exists for this user and event
            const existingNotification = await Notification.findOne({
                recipient: user._id,
                type: 'event_created',
                eventId: eventId
            });
            
            // Only create notification if it doesn't already exist
            if (!existingNotification) {
                return exports.createNotification(
                    user._id,
                    `A new event has been added: ${eventName}`,
                    'event_created',
                    null, // no workshop ID
                    null, // no workshop name
                    { 
                        eventName,
                        eventId
                    }
                );
            } else {
                console.log(`Skipping duplicate notification for user ${user._id} for event ${eventId}`);
                return null;
            }
        });
        
        const results = await Promise.all(notificationPromises);
        const createdCount = results.filter(r => r !== null).length;
        console.log(`Successfully created ${createdCount} notifications for new event: ${eventName}`);
    } catch (error) {
        console.error('Error notifying users about new event:', error);
        // Don't throw - we don't want to fail the event creation if notifications fail
    }
};

// Helper function to notify all stakeholders about a new loyalty program partner
exports.notifyAllUsersAboutLoyaltyPartner = async (vendorName, promoCode, discountRate) => {
    try {
        const User = require('../models/User');
        
        // Find all users with roles: student, staff, ta, professor
        const stakeholders = await User.find({ 
            role: { $in: ['student', 'staff', 'ta', 'professor'] } 
        });
        
        console.log(`Creating notifications for ${stakeholders.length} users about new loyalty partner: ${vendorName}`);
        
        // Create notification for each stakeholder
        const notificationPromises = stakeholders.map(user => 
            exports.createNotification(
                user._id,
                `New GUC Loyalty Program partner: ${vendorName}! Get ${discountRate}% off with promo code: ${promoCode}`,
                'loyalty_partner_added',
                null, // no workshop ID
                null, // no workshop name
                { 
                    vendorName,
                    promoCode,
                    discountRate
                }
            )
        );
        
        await Promise.all(notificationPromises);
        console.log(`Successfully created notifications for new loyalty partner: ${vendorName}`);
    } catch (error) {
        console.error('Error notifying users about new loyalty partner:', error);
        // Don't throw - we don't want to fail the loyalty program creation if notifications fail
    }
};

// Helper function to notify admin and events office about pending vendor requests
exports.notifyAdminAndEventsOfficeAboutVendorRequest = async (vendorName, vendorId) => {
    try {
        const User = require('../models/User');
        
        // Find all users with roles: admin, events_office
        const adminsAndEventsOffice = await User.find({ 
            role: { $in: ['admin', 'events_office'] } 
        });
        
        console.log(`Creating notifications for ${adminsAndEventsOffice.length} admin/events office users about pending vendor request: ${vendorName}`);
        
        // Create notification for each admin/events office user
        const notificationPromises = adminsAndEventsOffice.map(user => 
            exports.createNotification(
                user._id,
                `Vendor "${vendorName}" has a pending request awaiting review.`,
                'vendor_application_pending',
                null, // no workshop ID
                null, // no workshop name
                { 
                    vendorName,
                    vendorId
                }
            )
        );
        
        await Promise.all(notificationPromises);
        console.log(`Successfully created notifications for pending vendor request: ${vendorName}`);
    } catch (error) {
        console.error('Error notifying admin/events office about vendor request:', error);
        // Don't throw - we don't want to fail the vendor registration if notifications fail
    }
};

// Helper function to notify admin and events office about vendor applications (bazaar/booth)
exports.notifyAdminAndEventsOfficeAboutVendorApplication = async (vendorName, applicationType, eventName, vendorId, applicationId) => {
    try {
        const User = require('../models/User');
        
        // Find all users with roles: admin, events_office
        const adminsAndEventsOffice = await User.find({ 
            role: { $in: ['admin', 'events_office'] } 
        });
        
        console.log(`Creating notifications for ${adminsAndEventsOffice.length} admin/events office users about vendor application: ${vendorName} - ${applicationType}`);
        
        // Determine the message based on application type
        let message;
        if (applicationType === 'bazaar') {
            message = `Vendor "${vendorName}" has requested to join bazaar "${eventName}".`;
        } else if (applicationType === 'booth') {
            message = `Vendor "${vendorName}" has requested a standalone booth for "${eventName}".`;
        } else {
            message = `Vendor "${vendorName}" has submitted an application for "${eventName}".`;
        }
        
        // Create notification for each admin/events office user
        const notificationPromises = adminsAndEventsOffice.map(user => 
            exports.createNotification(
                user._id,
                message,
                'vendor_application_pending',
                null, // no workshop ID
                null, // no workshop name
                { 
                    vendorName,
                    vendorId,
                    applicationType,
                    applicationId,
                    eventName
                }
            )
        );
        
        await Promise.all(notificationPromises);
        console.log(`Successfully created notifications for vendor application: ${vendorName} - ${applicationType}`);
    } catch (error) {
        console.error('Error notifying admin/events office about vendor application:', error);
        // Don't throw - we don't want to fail the application if notifications fail
    }
};


