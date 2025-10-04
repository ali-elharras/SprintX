const mongoose = require("mongoose");

const conferenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
  },
  fullAgenda: {
    type: String,
    required: true,
  },
  websiteLink: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  },
  budget: {
    type: Number,
    required: true,
  },
  fundingSource: {
    type: String,
    enum: ['external', 'GUC'],
    required: true,
  },
  extraResources: {
    type: String,
    trim: true,
  },
}, { timestamps: true,
    collection: 'conferences'
 });

const Conference = mongoose.model("Conference", conferenceSchema);

module.exports = Conference;