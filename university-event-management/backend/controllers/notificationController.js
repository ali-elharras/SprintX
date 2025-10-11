const Notification = require('../models/Notification');

// GET /api/notifications - Get all notifications for the logged-in professor
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
        const notification = await Notification.createNotification({
            recipient: recipientId,
            message,
            type,
            workshopId,
            workshopName,
            metadata,
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};
