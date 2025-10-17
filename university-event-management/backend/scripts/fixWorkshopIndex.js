/**
 * Migration script to fix the Workshop collection index
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Drops the problematic unique index on workshopName
 * 3. Ensures workshops collection is properly set up
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Workshop = require('../models/Workshop');

async function fixWorkshopIndex() {
  try {
    console.log('🔧 Starting Workshop index fix...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/university-event-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get the Workshop collection
    const collection = mongoose.connection.collection('workshops');
    
    // List all indexes
    const indexes = await collection.getIndexes();
    console.log('📊 Current indexes on workshops collection:', Object.keys(indexes));
    
    // Drop the unique index on workshopName if it exists
    const indexesToDrop = [];
    for (const [indexName, indexSpec] of Object.entries(indexes)) {
      if (indexSpec.unique === true && indexSpec.key && indexSpec.key.workshopName === 1) {
        console.log(`🗑️ Found problematic index: ${indexName}`);
        indexesToDrop.push(indexName);
      }
    }
    
    // Drop each problematic index
    for (const indexName of indexesToDrop) {
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (err) {
        console.warn(`⚠️ Could not drop index ${indexName}: ${err.message}`);
      }
    }
    
    // Rebuild indexes from schema definition
    console.log('🔨 Rebuilding indexes from schema...');
    await Workshop.syncIndexes();
    console.log('✅ Indexes synced from schema');
    
    // Verify new state
    const newIndexes = await collection.getIndexes();
    console.log('📊 New indexes on workshops collection:', Object.keys(newIndexes));
    
    console.log('✅ Workshop index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing Workshop index:', error);
    process.exit(1);
  }
}

fixWorkshopIndex();
