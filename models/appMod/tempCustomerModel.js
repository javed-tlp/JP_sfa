const mongoose = require('mongoose');
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility

const tempCustomerSchema = new mongoose.Schema({
    mobile_no: { type: String, required: true },
    otp: { type: String, required: true },
    created_on: { 
        type: String, 
        default: getCurrentDateTime,  // Use the utility function to set the default value
    },  // Store createdAt as a String in the specified format
    otpVerified: { type: Boolean, default: false } // New field to track OTP verification status
});

// Use the collection name 'jps_temp_customer'
module.exports = mongoose.model('TempCustomer', tempCustomerSchema, 'jps_temp_customer');
