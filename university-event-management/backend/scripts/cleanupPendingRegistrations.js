const mongoose = require('mongoose');
const Registration = require('../models/Registration');
require('dotenv').config();

/**
 * Cleanup script to remove all pending registrations from the database.
 * 
 * This is needed after the payment flow restructure where registrations
 * are now only created after successful payment, not before.
 * 
 * Run this script once to clean up any old pending registrations.
 */

const cleanupPendingRegistrations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all pending registrations
    const pendingRegistrations = await Registration.find({
      $or: [
        { status: 'pending' },
        { paymentStatus: 'pending' }
      ]
    });

    console.log(`Found ${pendingRegistrations.length} pending registrations`);

    if (pendingRegistrations.length === 0) {
      console.log('No pending registrations to clean up');
      await mongoose.connection.close();
      return;
    }

    // Display some details
    console.log('\nPending registrations to be deleted:');
    pendingRegistrations.forEach((reg, index) => {
      console.log(`${index + 1}. Event: ${reg.event}, User: ${reg.email}, Status: ${reg.status}, Payment: ${reg.paymentStatus}`);
    });

    // Prompt for confirmation
    console.log('\nDeleting pending registrations...');
    
    // Delete all pending registrations
    const result = await Registration.deleteMany({
      $or: [
        { status: 'pending' },
        { paymentStatus: 'pending' }
      ]
    });

    console.log(`✓ Successfully deleted ${result.deletedCount} pending registrations`);
    console.log('\nCleanup complete!');
    console.log('Note: Users will need to re-register and complete payment for these events.');

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);

  } catch (error) {
    console.error('Error during cleanup:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the cleanup
cleanupPendingRegistrations();
