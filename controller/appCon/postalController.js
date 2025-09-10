// controllers/postalController.js
const { validationResult } = require('express-validator');
const Pincode = require('../../models/webMod/pincodeModel');

exports.fetchPostalDetailsByPincode = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid values.', status: 'invalid', err: errors.mapped() });
    }

    try {
        const { pincode } = req.body;
        const postalDetails = await Pincode.find({ pincode });

        if (postalDetails.length === 0) {
            return res.status(404).json({
                message: "No records found.",
                status: "error",
                result: { day_ta: postalDetails, count: postalDetails.length }
            });
        }

        res.status(200).json({
            message: "Postal details retrieved.",
            status: "success",
            result: { day_ta: postalDetails, count: postalDetails.length }
        });

    } catch (e) {
        res.status(500).json({ message: "Error occurred.", status: "error", err: e });
    }
};