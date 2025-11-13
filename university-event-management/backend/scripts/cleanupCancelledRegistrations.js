const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const cleanupCancelledRegistrations = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete all cancelled registrations
    const result = await Registration.deleteMany({ status: 'cancelled' });
    
    console.log(`Deleted ${result.deletedCount} cancelled registrations`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up cancelled registrations:', error);
    process.exit(1);
  }
};

cleanupCancelledRegistrations();
