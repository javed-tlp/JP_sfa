const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility

// Define the coupon schema
const newCouponSchema = new mongoose.Schema({
    coupon_id: { type: Number, unique: true }, // Auto-incrementing ID
    product_name: { type: String }, // Field to store product name
    coupon_reference: { type: String, required: true },
    coupon_code: { type: String, required: true, unique: true },
    product_id: { type: String, required: true },
    carpenter_reward: { type: Number, required: true },
    fabricator_reward: { type: Number, default: 0 },
    expiry_date: { type: String, required: true },
    created_on: { type: String },    // Store as String
    updated_on: { type: String },    // Store as String
    isScanned: {type: Boolean, default: false},
    isActive: { type: Boolean, default: true }, // Changed status to isActive for clarity
    scannedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
        scannedByName: { type: String, default: null },
        client_id: { type: Number },
        email: { type: String, default: null },
        mobile_no: { type: String, default: null },
        address: { type: String, default: null },
        trade_type: { type: String, default: null },
        trade_id: { type: String, default: null },
        scannedAt: { type: String, default: getCurrentDateTime }
    },
});

// Apply the AutoIncrement plugin to the newCoupon schema
newCouponSchema.plugin(AutoIncrement, { inc_field: 'coupon_id' });

// Pre-save hook to set created_on only for new documents
newCouponSchema.pre('save', function(next) {
    if (!this.created_on) {
        this.created_on = getCurrentDateTime(); // Set created_on only if it's not set
    }
    this.updated_on = getCurrentDateTime(); // Always update updated_on
    next();
});

// Specify the custom collection name 'jps_coupon'
const NewCoupon = mongoose.model('NewCoupon', newCouponSchema, 'jps_coupon');

// Export the NewCoupon model
module.exports = NewCoupon;
