const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility

const customerSchema = new mongoose.Schema({
    client_id: { type: Number },  // Unique ID for each customer
    name: { type: String, required: true },
    mobile_no: { type: String, required: true },
    email: { type: String, required: true },
    trade_id: { type: String },
    trade_type: { 
        type: String, 
        enum: ['carpenter', 'fabricator', 'plumber']
    },
    state: { type: String },    // Add state field
    district: { type: String }, // Add district field
    city: { type: String },     // Add city field
    area: { type: String },     // Keep address optional or remove
    age: { type: Number, min: 0 },
    pincode: { type: String }, // Add postal_code field
    address: { type: String },
    status: { type: Boolean, default: true },
    profile_picture: { type: String }, // New field for profile picture
    kyc_status: { 
        type: String, 
        enum: ['accepted', 'pending', 'discarded'], 
        default: 'pending'
    },
    token: { type: String },
    totalPoints: { type: Number, default: 0 },
    created_by: { type: String, required: true },
    otp: { type: String },           // New field for OTP
    validUpto: { type: String },       // New field for OTP validity
    created_on: { type: String },    // Store as String
    updated_on: { type: String },     // Store as String

    // New Fields
    bank_name: { type: String }, // Bank Name
    account_holder_name: { type: String }, // Account Holder Name
    branch_name: { type: String }, // Branch Name
    ifsc_code: { type: String }, // IFSC Code
    dob: { type: Date }, // Date of Birth
    upi_id: { type: String }, // UPI ID
    upi_scanner_image: { type: String },

    // Redeem OTP
    redeemOtp: {
        otp: { type: String }, // OTP value
        expiry: { type: Date } // Expiry time for OTP
    }
});

// Apply AutoIncrement plugin
customerSchema.plugin(AutoIncrement, { inc_field: 'client_id' });

// Pre-save hook to set created_on only for new documents
customerSchema.pre('save', function(next) {
    if (!this.created_on) {
        this.created_on = getCurrentDateTime(); // Set created_on only if it's not set
    }
    this.updated_on = getCurrentDateTime(); // Always update updated_on
    next();
});

// Export the Customer model
module.exports = mongoose.model('Customer', customerSchema, "jps_customers");
