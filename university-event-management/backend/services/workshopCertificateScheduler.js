const cron = require("node-cron");
const Workshop = require("../models/Workshop");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");
const emailService = require("./emailService");

// Track workshops that have already sent certificates to avoid duplicates
const processedWorkshops = new Set();

/**
 * Check for workshops that have ended and send certificates to attendees
 */
async function checkCompletedWorkshops() {
  try {
    const now = new Date();

    // Find workshops that have ended (endDate has passed) and are published
    const completedWorkshops = await Workshop.find({
      endDate: { $lt: now },
      status: "published", // Only published workshops
    }).lean();

    if (completedWorkshops.length === 0) {
      return;
    }

    console.log(
      `📧 Found ${completedWorkshops.length} completed workshop(s) to process certificates.`
    );

    for (const workshop of completedWorkshops) {
      // Skip if we've already processed this workshop
      const workshopKey = workshop._id.toString();
      if (processedWorkshops.has(workshopKey)) {
        continue;
      }

      try {
        // Find the associated published Event
        const event = await Event.findOne({
          title: workshop.workshopName,
          category: "workshop",
          isPublished: true,
        });

        if (!event) {
          continue;
        }

        // Find all confirmed/attended registrations for this event
        const registrations = await Registration.find({
          event: event._id,
          status: { $in: ["confirmed", "attended"] },
        }).lean();

        if (registrations.length === 0) {
          // Mark as processed even if no attendees
          processedWorkshops.add(workshopKey);
          continue;
        }

        let successCount = 0;
        let errorCount = 0;

        // Send certificate to each attendee
        for (const registration of registrations) {
          try {
            // Get user details
            const user = await User.findById(registration.user);

            if (!user) {
              errorCount++;
              continue;
            }

            // Only send to student/staff/ta/professor (not admin or events_office who don't attend)
            const eligibleRoles = ["student", "staff", "ta", "professor"];
            if (!eligibleRoles.includes(user.role.toLowerCase())) {
              continue;
            }

            // Send certificate email
            await emailService.sendWorkshopCertificate(
              user,
              workshop.workshopName,
              workshop.startDate,
              workshop.location
            );

            successCount++;
          } catch (emailError) {
            console.error(
              `Error sending certificate to user ${registration.user}:`,
              emailError
            );
            errorCount++;
          }
        }

        // Mark this workshop as processed
        processedWorkshops.add(workshopKey);

        if (successCount > 0) {
          console.log(
            `✅ Workshop "${workshop.workshopName}": ${successCount} certificate(s) sent`
          );
        }
      } catch (workshopError) {
        // Silently continue on errors
      }
    }
  } catch (error) {
    console.error("Error in checkCompletedWorkshops:", error);
  }
}

/**
 * Initialize the workshop certificate scheduler
 * Runs every 1 minute to check for completed workshops
 */
function initializeWorkshopCertificateScheduler() {
  console.log(
    "📧 Workshop Certificate Scheduler initialized (runs every 1 minute)"
  );

  // Run immediately on startup to catch any missed workshops
  checkCompletedWorkshops();

  // Schedule to run every 1 minute
  // Cron format: minute hour day month day-of-week
  cron.schedule("*/1 * * * *", () => {
    checkCompletedWorkshops();
  });
}

/**
 * Manually trigger certificate sending for a specific workshop (useful for testing or manual runs)
 */
async function sendCertificatesForWorkshop(workshopId) {
  try {
    const workshop = await Workshop.findById(workshopId);

    if (!workshop) {
      throw new Error("Workshop not found");
    }

    // Find the associated event
    const event = await Event.findOne({
      title: workshop.workshopName,
      category: "workshop",
      isPublished: true,
    });

    if (!event) {
      throw new Error("No published event found for this workshop");
    }

    // Find registrations
    const registrations = await Registration.find({
      event: event._id,
      status: { $in: ["confirmed", "attended"] },
    });

    console.log(
      `Manually sending certificates to ${registrations.length} attendees...`
    );

    for (const registration of registrations) {
      const user = await User.findById(registration.user);

      if (!user) {
        continue;
      }

      const eligibleRoles = ["student", "staff", "ta", "professor"];
      if (!eligibleRoles.includes(user.role.toLowerCase())) {
        continue;
      }

      await emailService.sendWorkshopCertificate(
        user,
        workshop.workshopName,
        workshop.startDate,
        workshop.location
      );

      console.log(`✅ Certificate sent to ${user.email}`);
    }

    return { success: true, count: registrations.length };
  } catch (error) {
    console.error("Error in manual certificate sending:", error);
    throw error;
  }
}

module.exports = {
  initializeWorkshopCertificateScheduler,
  checkCompletedWorkshops,
  sendCertificatesForWorkshop,
};
