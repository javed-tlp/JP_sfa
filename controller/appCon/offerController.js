// controller/appCon/offerController.js
const Offer = require('../../models/webMod/offerModel');
const giftmodel = require('../../models/webMod/giftModel');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');


// Get all active offers for the app
exports.getActiveOffers = async (req, res) => {
    try {
        const currentDate = new Date().toISOString().slice(0, 10); // Format current date to "YYYY-MM-DD"
        console.log("Formatted Current Date:", currentDate); // Log the formatted current date

        const offers = await Offer.find({
            status: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).populate('gifts');

        const offersCount = await Offer.countDocuments({
            status: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        });

        if (!offers.length) {
            return res.status(404).json({ error: 'No active offers available' });
        }
        
        return res.status(200).json({
            message: "All Active Offer:-",
            day_ta: offers,
            count: offersCount
        });
    } catch (error) {
        console.error("Error retrieving active offers:", error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getallgift = async (req, res) => {
    try {
        const allgift = await giftmodel.find({ status: true });
        const allgiftcount = await giftmodel.countDocuments({ status: true });
        return res.status(200).json({ data: allgift, count: allgiftcount });
    } catch (error) {
        console.error("Error fetching gifts:", error);
        return res.status(500).json({ message: "Error fetching gifts", error });
    }
};

exports.getgiftDetails = async (req, res) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Retrieve _id (gift_id) from the request body
        const { _id } = req.body;

        // Convert _id to a mongoose ObjectId
        const giftIdObject = new mongoose.Types.ObjectId(_id);

        // Fetch the gift details by _id (ensure status is true)
        const giftDetails = await giftmodel.findOne({ _id: giftIdObject, status: true });

        if (!giftDetails) {
            return res.status(404).json({ message: "Gift not found or unavailable" });
        }

        // Return the gift details if found
        return res.status(200).json({ data: giftDetails });

    } catch (error) {
        console.error("Error fetching gift details:", error);
        return res.status(500).json({ message: "Error fetching gift details", error });
    }
};
