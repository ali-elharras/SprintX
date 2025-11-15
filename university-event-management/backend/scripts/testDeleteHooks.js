/**
 * Test which mongoose hooks are triggered by findByIdAndDelete
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Conference = require('../models/Conference');

async function testHooks() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-events');
    console.log('✓ Connected to MongoDB\n');

    // Find a test registration
    const testReg = await Registration.findOne({ status: 'confirmed' });
    
    if (!testReg) {
      console.log('No confirmed registrations found to test with');
      process.exit(0);
    }

    console.log('Test Registration:');
    console.log(`  ID: ${testReg._id}`);
    console.log(`  Event: ${testReg.event}`);
    console.log(`  Email: ${testReg.email}`);
    console.log(`  Status: ${testReg.status}\n`);

    // Get the event and check current participants before
    let eventBefore = await Event.findById(testReg.event);
    if (!eventBefore) {
      eventBefore = await Conference.findById(testReg.event);
    }
    console.log(`Event participants BEFORE delete: ${eventBefore?.currentParticipants || 'N/A'}\n`);

    console.log('🗑️  Calling Registration.findByIdAndDelete()...\n');
    
    // This should trigger post("findOneAndDelete") middleware
    const deleted = await Registration.findByIdAndDelete(testReg._id);
    
    console.log('Deleted:', deleted ? 'Yes' : 'No');
    
    // Check event participants after
    let eventAfter = await Event.findById(testReg.event);
    if (!eventAfter) {
      eventAfter = await Conference.findById(testReg.event);
    }
    console.log(`\nEvent participants AFTER delete: ${eventAfter?.currentParticipants || 'N/A'}`);
    
    const difference = (eventBefore?.currentParticipants || 0) - (eventAfter?.currentParticipants || 0);
    console.log(`Difference: ${difference}`);
    
    if (difference === 1) {
      console.log('✅ Correct: Decremented by 1');
    } else if (difference === 2) {
      console.log('❌ BUG: Decremented by 2!');
    } else {
      console.log(`⚠️  Unexpected difference: ${difference}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testHooks();
