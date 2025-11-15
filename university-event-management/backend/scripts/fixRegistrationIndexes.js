/**
 * Fix Registration Collection Indexes
 * 
 * This script removes old duplicate-prevention indexes and recreates the correct
 * partial indexes that only apply to active registrations (confirmed/attended).
 * 
 * Run with: node scripts/fixRegistrationIndexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('../models/Registration');

async function fixIndexes() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log('Using MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Not found - using default');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/university-events');
    console.log('✓ Connected to MongoDB');

    // Get the collection
    const collection = mongoose.connection.collection('registrations');

    // List current indexes
    console.log('\n📋 Current indexes:');
    const currentIndexes = await collection.indexes();
    currentIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), 
        index.partialFilterExpression ? `(partial: ${JSON.stringify(index.partialFilterExpression)})` : '');
    });

    // Drop old problematic indexes if they exist
    const indexesToDrop = [
      'event_1_email_1',        // Old simple index without partial filter
      'event_1_universityId_1'  // Old simple index without partial filter
    ];

    console.log('\n🗑️  Dropping old indexes...');
    for (const indexName of indexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`  ✓ Dropped ${indexName}`);
      } catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log(`  ℹ️  ${indexName} not found (already removed or never existed)`);
        } else {
          console.log(`  ⚠️  Could not drop ${indexName}:`, error.message);
        }
      }
    }

    // Recreate indexes using the model
    console.log('\n🔨 Creating new partial indexes...');
    await Registration.syncIndexes();
    console.log('  ✓ Indexes synchronized from model');

    // Verify new indexes
    console.log('\n📋 Updated indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), 
        index.partialFilterExpression ? `(partial: ${JSON.stringify(index.partialFilterExpression)})` : '');
    });

    console.log('\n✅ Index fix completed successfully!');
    console.log('\nℹ️  Note: Users can now re-register after cancelling, as the unique constraint');
    console.log('   only applies to active registrations (confirmed/attended status).');

  } catch (error) {
    console.error('\n❌ Error fixing indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the fix
fixIndexes();
