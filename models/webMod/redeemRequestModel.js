const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility

const redeemRequestSchema = new mongoose.Schema({
    request_id: { type: Number },  // Unique ID for each redeem request
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    gift_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift', required: true },
    offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    points: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'discarded'], default: 'pending' },

    // Fields to store only specific names of user, gift, and offer
    user_name: { type: String, required: true },
    gift_name: { type: String, required: true },
    offer_name: { type: String },

    created_on: { type: String }, // Store as String
    updated_on: { type: String }  // Store as String
});

// Apply AutoIncrement plugin
redeemRequestSchema.plugin(AutoIncrement, { inc_field: 'request_id' });

// Pre-save hook to set created_on for new documents and update updated_on for all saves
redeemRequestSchema.pre('save', function(next) {
    if (!this.created_on) {
        this.created_on = getCurrentDateTime(); // Set created_on only if not already set
    }
    this.updated_on = getCurrentDateTime(); // Always update updated_on
    next();
});

// Export the RedeemRequest model
module.exports = mongoose.model('RedeemRequest', redeemRequestSchema, 'jps_redeem_requests');
