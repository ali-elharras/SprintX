/*
  listAllWorkshops.js
  ---------------------------------
  Script to list all workshops in the database
*/

require('dotenv').config();
const mongoose = require('mongoose');
const Workshop = require('../models/Workshop');
const Event = require('../models/Event');

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not set.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected.');

  try {
    const workshops = await Workshop.find({});
    console.log(`\nFound ${workshops.length} workshop(s):\n`);
    
    workshops.forEach((w, index) => {
      console.log(`${index + 1}. Workshop Name: "${w.workshopName}"`);
      console.log(`   ID: ${w._id}`);
      console.log(`   Status: ${w.status}`);
      console.log(`   Published Event ID: ${w.publishedEventId || 'None'}`);
      console.log(`   Created: ${w.createdAt}`);
      console.log('');
    });

    // Also list events that might be workshops
    const events = await Event.find({ type: 'workshop' });
    console.log(`\nFound ${events.length} event(s) with type 'workshop':\n`);
    
    events.forEach((e, index) => {
      console.log(`${index + 1}. Event Name: "${e.name}"`);
      console.log(`   ID: ${e._id}`);
      console.log(`   Status: ${e.status}`);
      console.log(`   Created: ${e.createdAt}`);
      console.log('');
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
