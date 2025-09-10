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

exports.fetchStatesList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid values.', status: 'invalid', err: errors.mapped() });
    }

    try {
        const { state} = req.body;
        let filter = {};

        if (state) {
            filter.state = { $regex: state, $options: 'i' };
        }

        const statesList = await Pincode.distinct('state', filter);

        if (statesList.length === 0) {
            return res.status(404).json({
                message: "No states found for the given filters.",
                status: "error",
                result: { day_ta: statesList, count: statesList.length }
            });
        }

        res.status(200).json({
            message: "States list retrieved.",
            status: "success",
            result: { day_ta: statesList, count: statesList.length }
        });

    } catch (e) {
        res.status(500).json({ message: "Error occurred.", status: "error", err: e });
    }
};

exports.fetchDistrictsList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid values.', status: 'invalid', err: errors.mapped() });
    }

    try {
        const { state, district } = req.body;
        let filter = {};

        if (state) {
            filter.state = { $regex: state, $options: 'i' };
        }

        if (district) {
            filter.district = { $regex: district, $options: 'i' };
        }

        const districtsList = await Pincode.distinct('district', filter);

        if (districtsList.length === 0) {
            return res.status(404).json({
                message: "No districts found for the given state and district.",
                status: "error",
                result: { day_ta: districtsList, count: districtsList.length }
            });
        }

        res.status(200).json({
            message: "Districts list retrieved.",
            status: "success",
            result: { day_ta: districtsList, count: districtsList.length }
        });

    } catch (e) {
        res.status(500).json({ message: "Error occurred.", status: "error", err: e });
    }
};


exports.fetchCitiesList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid values.', status: 'invalid', err: errors.mapped() });
    }

    try {
        const { state, district } = req.body;
        let filter = {};

        if (state) {
            filter.state = { $regex: state, $options: 'i' };
        }

        if (district) {
            filter.district = { $regex: district, $options: 'i' };
        }

        const citiesList = await Pincode.distinct('city', filter);
        console.log(citiesList)

        if (citiesList.length === 0) {

            return res.status(404).json({
                message: "No cities found for the given state and district.",
                status: "error",
                result: { day_ta: citiesList, count: citiesList.length }
            });
        }

        res.status(200).json({
            message: "Cities list retrieved.",
            status: "success",
            result: { day_ta: citiesList, count: citiesList.length }
        });

    } catch (e) {
        res.status(500).json({ message: "Error occurred.", status: "error", err: e });
    }
};

exports.fetchPostOfficesList = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid values.', status: 'invalid', err: errors.mapped() });
    }

    try {
        const { state, district, city } = req.body;
        let filter = {};

        if (state) {
            filter.state = { $regex: state, $options: 'i' };
        }

        if (district) {
            filter.district = { $regex: district, $options: 'i' };
        }

        if (city) {
            filter.city = { $regex: city, $options: 'i' };
        }

        const postOfficesList = await Pincode.find(filter, 'postOfficeName pincode district city state');

        if (postOfficesList.length === 0) {
            return res.status(404).json({
                message: "No post offices found for the given criteria.",
                status: "error",
                result: { day_ta: postOfficesList, count: postOfficesList.length }
            });
        }

        res.status(200).json({
            message: "Post offices list retrieved.",
            status: "success",
            result: { day_ta: postOfficesList, count: postOfficesList.length }
        });

    } catch (e) {
        res.status(500).json({ message: "Error occurred.", status: "error", err: e });
    }
};
