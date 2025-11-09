const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LoyaltyProgramSchema = new Schema({
    discountRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    promoCode: {
        type: String,
        required: true,
        unique: true
    },
    termsAndConditions: {
        type: String,
        required: true
    },
    Vendor : {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    }
})
module.exports = mongoose.model('LoyaltyProgram', LoyaltyProgramSchema);
