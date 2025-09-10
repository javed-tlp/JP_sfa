const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility

// User schema
const userSchema = new mongoose.Schema({
    user_id: { type: Number, unique: true },
    name: { type: String, required: true },
    mobile_no: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    session_token: { type: String, default: null },
    status: { type: Boolean, default: true },
    created_on: { type: String, default: getCurrentDateTime }, // Store as String
    updated_on: { type: String, default: getCurrentDateTime }, // Store as String
});

// Apply the AutoIncrement plugin
userSchema.plugin(AutoIncrement, { inc_field: 'user_id' });

// Pre-save hook to set the updated_on field to the current date-time
userSchema.pre('save', function(next) {
    this.updated_on = getCurrentDateTime(); // Always set updated_on
    next();
});

// Export the User model
module.exports = mongoose.model("User", userSchema, "jps_system_admin");
