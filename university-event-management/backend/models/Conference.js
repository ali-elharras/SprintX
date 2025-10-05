const mongoose = require('mongoose');

const conferenceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Conference', conferenceSchema);