/**
 * Check for duplicate or problematic registrations
 * 
 * Run with: node scripts/checkDuplicateRegistrations.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('../models/Registration');

async function checkDuplicates() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-events');
    console.log('✓ Connected to MongoDB\n');

    // Find all registrations grouped by event and email
    const duplicates = await Registration.aggregate([
      {
        $group: {
          _id: { event: '$event', email: '$email' },
          count: { $sum: 1 },
          registrations: { $push: { _id: '$_id', status: '$status', registrationDate: '$registrationDate' } }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate registrations found!');
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate registration groups:\n`);
      
      for (const dup of duplicates) {
        console.log(`Event: ${dup._id.event}, Email: ${dup._id.email}`);
        console.log(`  Registrations (${dup.count}):`);
        dup.registrations.forEach(reg => {
          console.log(`    - ID: ${reg._id}, Status: ${reg.status}, Date: ${reg.registrationDate}`);
        });
        console.log('');
      }

      // Suggest cleanup
      console.log('💡 Suggestions:');
      console.log('   - Keep the most recent registration with status "confirmed" or "attended"');
      console.log('   - Cancel or delete older duplicates');
      console.log('   - Run cleanupDuplicateRegistrations.js to automatically fix this');
    }

    // Check for cancelled registrations that might be blocking re-registration
    const cancelledCount = await Registration.countDocuments({ status: 'cancelled' });
    console.log(`\n📊 Statistics:`);
    console.log(`   - Total registrations: ${await Registration.countDocuments()}`);
    console.log(`   - Cancelled registrations: ${cancelledCount}`);
    console.log(`   - Pending registrations: ${await Registration.countDocuments({ status: 'pending' })}`);
    console.log(`   - Confirmed registrations: ${await Registration.countDocuments({ status: 'confirmed' })}`);
    console.log(`   - Attended registrations: ${await Registration.countDocuments({ status: 'attended' })}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkDuplicates();
