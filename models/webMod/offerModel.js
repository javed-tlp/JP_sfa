const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil');

const offerSchema = new mongoose.Schema({
    offer_id: { type: Number },
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    gifts: [{ 
        type: Object, 
        required: true 
    }],
    pointsRequired: { type: Number },
    status: { type: Boolean, default: true },
    created_on: { type: String },
    updated_on: { type: String }
});

offerSchema.plugin(AutoIncrement, { inc_field: 'offer_id' });

offerSchema.pre('save', function(next) {
    if (!this.created_on) {
        this.created_on = getCurrentDateTime();
    }
    this.updated_on = getCurrentDateTime();

    if (!this.startDate) {
        this.startDate = getCurrentDateTime();
    }
    if (!this.endDate) {
        this.endDate = getCurrentDateTime();
    }

    next();
});

module.exports = mongoose.model('Offer', offerSchema, 'jps_offers');
