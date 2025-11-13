require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Registration = require('../models/Registration');

const checkRegistrations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const cancelled = await Registration.find({ status: 'cancelled' });
    console.log('Cancelled registrations:', cancelled.length);
    
    const all = await Registration.find({});
    console.log('All registrations:', all.length);
    
    const byStatus = await Registration.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\nRegistrations by status:');
    byStatus.forEach(s => console.log(`  ${s._id}: ${s.count}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkRegistrations();
