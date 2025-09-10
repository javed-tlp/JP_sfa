const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    mobile_no: { type: String, required: true, unique: true },  // Mobile number for login (unique)
    name: { type: String, required: true },                     // Customer's name
    email: { type: String, required: true },                    // Customer's email
    address: { type: String, required: true },                  // Customer's address
    trade_type: { type: String, required: true },               // Customer's trade type
    trade_id: { type: Number, required: true },                 // Customer's trade ID
    otp: { type: String },                                      // OTP field for verification (optional)
    status: { type: Boolean, default: true },                   // Soft delete flag
    token: { type: String }                                     // Add this field to store the JWT token
}, { timestamps: true });

// Export the model, avoiding re-compilation
module.exports = mongoose.models.Customer || mongoose.model('Customer', customerSchema, "jps_customers");
