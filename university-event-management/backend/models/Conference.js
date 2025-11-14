const mongoose = require('mongoose');

const conferenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Conference name is required'],
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true
    },
    fullAgenda: {
        type: String,
        trim: true
    },
    websiteLink: {
        type: String,
        trim: true
    },
    requiredBudget: {
        type: Number,
        min: [0, 'Budget cannot be negative'],
        default: 0
    },
    sourceOfFunding: {
        type: String,
        required: [true, 'Source of funding is required'],
        enum: {
            values: ['GUC', 'external'],
            message: 'Source of funding must be either GUC or external'
        }
    },
    extraRequiredResources: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    maxParticipants: {
        type: Number,
        required: [true, 'Max participants is required'],
        min: [1, 'Max participants must be at least 1']
    },
    currentParticipants: {
        type: Number,
        default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Conference', conferenceSchema);