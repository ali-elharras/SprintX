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
        
        // Create notification for each stakeholder
        const notificationPromises = stakeholders.map(user => 
            exports.createNotification(
                user._id,
                `A new event has been added: ${eventName}`,
                'event_created',
                null, // no workshop ID
                null, // no workshop name
                { 
                    eventName,
                    eventId
                }
            )
        );
        
        await Promise.all(notificationPromises);
        console.log(`Successfully created notifications for new event: ${eventName}`);
    } catch (error) {
        console.error('Error notifying users about new event:', error);
        // Don't throw - we don't want to fail the event creation if notifications fail
    }
};

// Helper function to notify all stakeholders about a new loyalty program partner
exports.notifyAllUsersAboutLoyaltyPartner = async (vendorName) => {
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
                `New GUC Loyalty Program partner added: ${vendorName}`,
                'loyalty_partner_added',
                null, // no workshop ID
                null, // no workshop name
                { 
                    vendorName
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
