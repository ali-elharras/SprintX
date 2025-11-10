const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Recipient (professor who will receive this notification)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification recipient is required"],
      index: true,
    },
    
    // Notification message
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    
    // Type of notification for categorization
    type: {
      type: String,
      enum: [
        "workshop_submitted", 
        "workshop_rejected", 
        "workshop_edit_requested", 
        "workshop_published",
        "professor_workshop_submitted",  // For Events Office
        "professor_workshop_edited",      // For Events Office
        "event_created",                   // For all users when new event is created
        "loyalty_partner_added"           // For all users when vendor joins loyalty program
      ],
      required: true,
    },
    
    // Reference to the related workshop
    workshopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workshop",
      required: false,
    },
    
    // Workshop name for quick reference
    workshopName: {
      type: String,
      trim: true,
    },
    
    // Event name for event notifications
    eventName: {
      type: String,
      trim: true,
    },
    
    // Event ID for event notifications
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    },
    
    // Professor name for Events Office notifications
    professorName: {
      type: String,
      trim: true,
    },
    
    // Vendor name for loyalty program notifications
    vendorName: {
      type: String,
      trim: true,
    },
    
    // Read/Unread status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    // Additional data (e.g., edit request message)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({ recipient: userId, isRead: false });
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function (userId) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
};

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  const notification = new this(data);
  return await notification.save();
};

module.exports = mongoose.model("Notification", notificationSchema);
