const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const { createNotification } = require('../controllers/notificationController');

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
      start: new Date(now.getTime() + 58 * 60 * 1000),  // 58 minutes
      end: new Date(now.getTime() + 62 * 60 * 1000),    // 62 minutes (1h 2min)
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
    // Find all users registered for this event
    const registrations = await Registration.find({
      event: event._id,
      status: 'confirmed', // Only send to confirmed registrations
    }).populate('user', '_id firstName lastName');

    if (registrations.length === 0) {
      console.log(`📭 No registered users found for event: ${event.title}`);
      return;
    }

    console.log(`📬 Checking ${timeframe} reminder for "${event.title}" for ${registrations.length} users`);

    let sentCount = 0;
    let skippedCount = 0;

    // Create notification for each registered user (only if not already sent)
    const notificationPromises = registrations.map(async (registration) => {
      if (!registration.user) return;
      
      // Check if this user already has a reminder notification for this event and timeframe
      const existingReminder = await Notification.findOne({
        recipient: registration.user._id,
        type: 'event_reminder',
        eventId: event._id,
        'metadata.timeframe': timeframe
      });

      if (existingReminder) {
        skippedCount++;
        console.log(`⏭️  Reminder already sent to user ${registration.user._id} for "${event.title}" (${timeframe})`);
        return null;
      }

      const message = `Reminder: "${event.title}" starts in ${timeframe}`;
      
      try {
        await createNotification(
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
        );
        sentCount++;
      } catch (err) {
        console.error(`Failed to send reminder to user ${registration.user._id}:`, err);
      }
    });

    await Promise.all(notificationPromises);
    
    console.log(`✅ Sent ${sentCount} new ${timeframe} reminders for "${event.title}" (${skippedCount} already sent)`);
  } catch (error) {
    console.error(`❌ Error sending reminder for event ${event._id}:`, error);
  }
};

module.exports = {
  checkAndSendEventReminders,
};
