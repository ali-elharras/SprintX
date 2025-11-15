/**
 * Find specific registration by email and event
 * 
 * Run with: node scripts/findRegistration.js <email> <eventId>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

async function findRegistration() {
  const email = process.argv[2] || 'student@guc.edu.eg';
  const eventId = process.argv[3] || '69163acec7bd39f3bedc1fc1';

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-events');
    console.log('✓ Connected to MongoDB\n');

    console.log(`Searching for registrations:`);
    console.log(`  Email: ${email}`);
    console.log(`  Event ID: ${eventId}\n`);

    const registrations = await Registration.find({
      email: email.toLowerCase(),
      event: eventId
    }).populate('event', 'title type cost');

    if (registrations.length === 0) {
      console.log('❌ No registrations found for this email and event');
    } else {
      console.log(`✅ Found ${registrations.length} registration(s):\n`);
      
      registrations.forEach((reg, index) => {
        console.log(`${index + 1}. Registration ID: ${reg._id}`);
        console.log(`   Status: ${reg.status}`);
        console.log(`   Payment Status: ${reg.paymentStatus}`);
        console.log(`   Name: ${reg.firstName} ${reg.lastName}`);
        console.log(`   University ID: ${reg.universityId}`);
        console.log(`   Registration Date: ${reg.registrationDate}`);
        console.log(`   Event: ${reg.event?.title || 'Unknown'}`);
        console.log(`   Event Type: ${reg.event?.type || 'Unknown'}`);
        console.log(`   Event Cost: $${reg.event?.cost || 0}`);
        console.log('');
      });

      if (registrations.some(r => r.status === 'pending')) {
        console.log('💡 Tip: Pending registrations may be blocking new registrations.');
        console.log('   Consider cancelling or deleting them if payment was not completed.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

findRegistration();
