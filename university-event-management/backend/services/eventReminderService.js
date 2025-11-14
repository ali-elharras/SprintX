const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { createNotification } = require('../controllers/notificationController');

// Track which reminders have been sent to avoid duplicates
const sentReminders = new Set();

/**
 * Check and send event reminders for registered users
 * Sends reminders 1 day and 1 hour before event start time
 */
const checkAndSendEventReminders = async () => {
  try {
    console.log('🔔 [EVENT REMINDERS] Checking for upcoming events...');
    const now = new Date();
    
    // Calculate time windows
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const oneDayWindow = {
      start: new Date(now.getTime() + 23 * 60 * 60 * 1000), // 23 hours
      end: new Date(now.getTime() + 25 * 60 * 60 * 1000),   // 25 hours
    };
    
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    const oneHourWindow = {
      start: new Date(now.getTime() + 55 * 60 * 1000),  // 55 minutes
      end: new Date(now.getTime() + 65 * 60 * 1000),    // 65 minutes (1h 5min)
    };

    // Find events starting in ~24 hours
    const eventsIn24Hours = await Event.find({
      startDate: {
        $gte: oneDayWindow.start,
        $lte: oneDayWindow.end,
      },
      status: 'published',
    });

    // Find events starting in ~1 hour
    const eventsIn1Hour = await Event.find({
      startDate: {
        $gte: oneHourWindow.start,
        $lte: oneHourWindow.end,
      },
      status: 'published',
    });

    console.log(`📅 Found ${eventsIn24Hours.length} events starting in 24 hours`);
    console.log(`⏰ Found ${eventsIn1Hour.length} events starting in 1 hour`);

    // Send 24-hour reminders
    for (const event of eventsIn24Hours) {
      await sendEventReminder(event, '1 day');
    }

    // Send 1-hour reminders
    for (const event of eventsIn1Hour) {
      await sendEventReminder(event, '1 hour');
    }

    // Clean up old sent reminders (older than 2 days)
    cleanupSentReminders();
    
    console.log('✅ [EVENT REMINDERS] Check completed');
  } catch (error) {
    console.error('❌ [EVENT REMINDERS] Error checking reminders:', error);
  }
};

/**
 * Send reminder notification to all registered users for an event
 */
const sendEventReminder = async (event, timeframe) => {
  try {
    const reminderKey = `${event._id}-${timeframe}`;
    
    // Check if we already sent this reminder
    if (sentReminders.has(reminderKey)) {
      console.log(`⏭️  Reminder already sent for "${event.title}" (${timeframe})`);
      return;
    }

    // Find all users registered for this event
    const registrations = await Registration.find({
      event: event._id,
      status: 'confirmed', // Only send to confirmed registrations
    }).populate('user', '_id firstName lastName');

    if (registrations.length === 0) {
      console.log(`📭 No registered users found for event: ${event.title}`);
      return;
    }

    console.log(`📬 Sending ${timeframe} reminder for "${event.title}" to ${registrations.length} users`);

    // Create notification for each registered user
    const notificationPromises = registrations.map(registration => {
      if (!registration.user) return Promise.resolve();
      
      const message = `Reminder: "${event.title}" starts in ${timeframe}`;
      
      return createNotification(
        registration.user._id,
        message,
        'event_reminder',
        null, // no workshop ID
        null, // no workshop name
        {
          eventName: event.title,
          eventId: event._id,
          timeframe,
        }
      ).catch(err => {
        console.error(`Failed to send reminder to user ${registration.user._id}:`, err);
      });
    });

    await Promise.all(notificationPromises);
    
    // Mark this reminder as sent
    sentReminders.add(reminderKey);
    
    console.log(`✅ Sent ${timeframe} reminders for "${event.title}"`);
  } catch (error) {
    console.error(`❌ Error sending reminder for event ${event._id}:`, error);
  }
};

/**
 * Clean up old sent reminder keys to prevent memory leaks
 */
const cleanupSentReminders = () => {
  // Keep only recent reminders (simple approach - clear all if size gets too large)
  if (sentReminders.size > 10000) {
    console.log('🧹 Cleaning up sent reminders cache');
    sentReminders.clear();
  }
};

module.exports = {
  checkAndSendEventReminders,
};
