/**
 * Delete a specific registration by ID
 * Useful for cleaning up problematic pending registrations
 * 
 * Run with: node scripts/deleteRegistration.js <registrationId>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('../models/Registration');

async function deleteRegistration() {
  const registrationId = process.argv[2];

  if (!registrationId) {
    console.error('❌ Please provide a registration ID');
    console.log('Usage: node scripts/deleteRegistration.js <registrationId>');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-events');
    console.log('✓ Connected to MongoDB\n');

    // Find the registration first
    const registration = await Registration.findById(registrationId);
    
    if (!registration) {
      console.log(`❌ Registration with ID ${registrationId} not found`);
      process.exit(1);
    }

    console.log('Found registration:');
    console.log(`  ID: ${registration._id}`);
    console.log(`  Name: ${registration.firstName} ${registration.lastName}`);
    console.log(`  Email: ${registration.email}`);
    console.log(`  Status: ${registration.status}`);
    console.log(`  Payment Status: ${registration.paymentStatus}`);
    console.log(`  Registration Date: ${registration.registrationDate}\n`);

    // Delete the registration
    await Registration.findByIdAndDelete(registrationId);
    console.log('✅ Registration deleted successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

deleteRegistration();
