const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and professor role
router.use(protect);
router.use(authorize('professor', 'staff')); // Include staff temporarily for testing

// Get all notifications for logged-in professor
router.get('/', notificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Delete all notifications
router.delete('/', notificationController.deleteAllNotifications);

// Mark specific notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Delete specific notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
