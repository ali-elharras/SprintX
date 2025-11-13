require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Conference = require('../models/Conference');

const checkEventCosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check regular events
    const events = await Event.find({ type: 'trip' }).select('title type cost');
    console.log('=== TRIP EVENTS ===');
    events.forEach(event => {
      console.log(`${event.title}: $${event.cost || 0} (type: ${event.type})`);
    });

    // Check conferences
    const conferences = await Conference.find({}).select('title cost');
    console.log('\n=== CONFERENCES ===');
    conferences.forEach(conf => {
      console.log(`${conf.title}: $${conf.cost || 0}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkEventCosts();
