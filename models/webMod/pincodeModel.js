// models/pincodeModel.js
const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  postOfficeName: { type: String, required: true },
  pincode: { type: Number, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
});

module.exports = mongoose.model('jps_pincodes', pincodeSchema);
