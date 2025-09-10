const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil');

const giftSchema = new mongoose.Schema({
    gift_id: { type: Number },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image_path: { type: String },
    points: { type: Number, required: true },
    status: { type: Boolean, default: true },
    created_on: { type: String },
    updated_on: { type: String }
});

giftSchema.plugin(AutoIncrement, { inc_field: 'gift_id' });

giftSchema.pre('save', function (next) {
    if (!this.created_on) {
        this.created_on = getCurrentDateTime();
    }
    this.updated_on = getCurrentDateTime();
    next();
});

module.exports = mongoose.model('Gift', giftSchema, "jps_gifts");
