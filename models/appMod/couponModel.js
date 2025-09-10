const mongoose = require('mongoose');
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility

const couponSchema = new mongoose.Schema({
    coupon_id: { type: Number, unique: true },
    coupon_code: { type: String, required: true, unique: true },
    product_name: { type: String, required: true },
    carpenter_reward: { type: Number },
    fabricator_reward: { type: Number },
    isScanned: { type: Boolean, default: false },
    scannedBy: { 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null }, // Reference to the Customer model
        scannedByName: { type: String, default: null }, // Customer's name
        client_id: { type: Number },
        email: { type: String, default: null }, // Customer's email
        mobile_no: { type: String, default: null }, // Customer's mobile number
        address: { type: String, default: null }, // Customer's address
        trade_type: { type: String, default: null }, // Customer's trade type
        trade_id: { type: String, default: null }, // Customer's trade ID
        scannedAt: { type: String, default: getCurrentDateTime } // When the coupon was scanned, using the utility
    },
    expiry_date: { type: Date, required: true }
});

// Pre-save hook to set the `scannedAt` field if it's not already set
couponSchema.pre('save', function(next) {
    if (this.isScanned && !this.scannedBy.scannedAt) {
        this.scannedBy.scannedAt = getCurrentDateTime(); // Set scannedAt only if the coupon is scanned
    }
    next();
});

const Coupon = mongoose.model('Coupon', couponSchema, "jps_coupon");

module.exports = Coupon;
