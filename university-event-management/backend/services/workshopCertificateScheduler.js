const cron = require("node-cron");
const Workshop = require("../models/Workshop");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const User = require("../models/User");
const emailService = require("./emailService");

/**
 * Check for workshops that have ended and send certificates to attendees
 */
async function checkCompletedWorkshops() {
  try {
    const now = new Date();

    // Find workshops that have ended, are published, and haven't sent certificates yet
    const completedWorkshops = await Workshop.find({
      endDate: { $lt: now },
      status: "published",
      certificatesSent: { $ne: true }, // Only workshops that haven't sent certificates
    }).lean();

    console.log(
      `[Certificate Scheduler] Found ${completedWorkshops.length} completed workshops`
    );

    if (completedWorkshops.length === 0) {
      return;
    }

    for (const workshop of completedWorkshops) {
      console.log(
        `[Certificate Scheduler] Processing: ${workshop.workshopName}`
      );

      try {
        // Find the associated published Event using publishedEventId
        let event = null;

        if (workshop.publishedEventId) {
          event = await Event.findById(workshop.publishedEventId);
        }

        // Fallback: try to find by name if publishedEventId doesn't work
        if (!event) {
          event = await Event.findOne({
            title: workshop.workshopName,
            category: "workshop",
            isPublished: true,
          });
        }

        if (!event) {
          console.log(
            `[Certificate Scheduler] No event found for: ${workshop.workshopName} (publishedEventId: ${workshop.publishedEventId}) - skipping`
          );
          continue;
        }

        console.log(
          `[Certificate Scheduler] Event found: ${event.title} (ID: ${event._id})`
        );

        // Find all confirmed/attended registrations for this event
        const registrations = await Registration.find({
          event: event._id,
          status: { $in: ["confirmed", "attended"] },
        }).lean();

        console.log(
          `[Certificate Scheduler] Found ${registrations.length} registrations`
        );

        if (registrations.length === 0) {
          console.log(`[Certificate Scheduler] No registrations - skipping`);
          continue;
        }

        // Send certificate to each attendee
        let emailsSent = 0;

        for (const registration of registrations) {
          try {
            // Use the email from registration (entered when applying)
            const registrationEmail = registration.email;
            const fullName = `${registration.firstName} ${registration.lastName}`;

            if (!registrationEmail) {
              console.log(
                `[Certificate Scheduler] Skipping registration - no email`
              );
              continue;
            }

            // Collect all emails to send to
            const emailsToSend = [registrationEmail];

            // If user is linked, also send to their account emails
            if (registration.user) {
              const user = await User.findById(registration.user);
              if (user) {
                // Add account email if different from registration email
                if (user.email && user.email !== registrationEmail) {
                  emailsToSend.push(user.email);
                }
                // Add verification email if different from both
                if (
                  user.verificationEmail &&
                  user.verificationEmail !== registrationEmail &&
                  user.verificationEmail !== user.email
                ) {
                  emailsToSend.push(user.verificationEmail);
                }
              }
            }

            console.log(
              `[Certificate Scheduler] Sending to: ${emailsToSend.join(", ")}`
            );

            // Send certificate email to all emails
            await emailService.sendWorkshopCertificate(
              emailsToSend,
              fullName,
              workshop.workshopName,
              workshop.startDate,
              workshop.location
            );

            console.log(`✅ Certificate sent to ${emailsToSend.join(", ")}`);
            emailsSent++;
          } catch (emailError) {
            console.error(
              `[Certificate Scheduler] Email error for ${registration.email}:`,
              emailError.message
            );
          }
        }

        // Only mark as processed if at least one email was sent
        if (emailsSent > 0) {
          await Workshop.findByIdAndUpdate(workshop._id, {
            certificatesSent: true,
            certificatesSentAt: new Date(),
          });

          console.log(
            `[Certificate Scheduler] Marked ${workshop.workshopName} as processed (${emailsSent} emails sent)`
          );
        } else {
          console.log(
            `[Certificate Scheduler] No emails sent for ${workshop.workshopName} - will retry next time`
          );
        }
      } catch (workshopError) {
        console.error(
          `[Certificate Scheduler] Error processing ${workshop.workshopName}:`,
          workshopError.message
        );
      }
    }
  } catch (error) {
    console.error("[Certificate Scheduler] Fatal error:", error);
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
      const registrationEmail = registration.email;
      const fullName = `${registration.firstName} ${registration.lastName}`;

      if (!registrationEmail) {
        continue;
      }

      await emailService.sendWorkshopCertificate(
        registrationEmail,
        fullName,
        workshop.workshopName,
        workshop.startDate,
        workshop.location
      );

      console.log(`✅ Certificate sent to ${registrationEmail}`);
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
