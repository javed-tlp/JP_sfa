const mongoose = require('mongoose');
const RedeemRequest = require('../../models/webMod/redeemRequestModel');
const Customer = require('../../models/webMod/customerModel');
const Gift = require('../../models/webMod/giftModel');
const Offer = require('../../models/webMod/offerModel');
const Coupon = require("../../models/webMod/newCouponModel")

const sendOtpToCustomer = require('../../middlewares/otpService');
const { validationResult } = require('express-validator');

// Send OTP for redeem
exports.sendOtpForRedeem = async (req, res) => {
    try {
        const user_id = req.userId;

        const user = await Customer.findOne({ _id: user_id });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate and send OTP
        const { success, otp } = await sendOtpToCustomer(user.mobile_no);
        if (!success) {
            return res.status(500).json({ message: 'Failed to send OTP' });
        }

        const expiry = new Date(Date.now() + 60 * 1000); // OTP valid for 60 seconds

        // Save OTP and expiry in the database
        user.redeemOtp = { otp, expiry };
        console.log("OTp----->>>",user.redeemOtp)
        await user.save();

        return res.status(200).json({ message: 'OTP sent successfully', OTP: otp });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

exports.redeemRequest = async (req, res) => {
    try {
        const { otp, gift_id } = req.body;
        const user_id = req.userId;

        // Step 1: Validate gift_id
        const giftIdObject = new mongoose.Types.ObjectId(gift_id);

        const gift = await Gift.findOne({ _id: giftIdObject, status: true });
        if (!gift) return res.status(404).json({ message: 'Gift not available' });

        // Step 2: Find user and verify OTP
        const user = await Customer.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { redeemOtp } = user;
        if (!redeemOtp || !redeemOtp.otp) {
            return res.status(400).json({ message: 'OTP not sent or expired' });
        }

        if (redeemOtp.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > redeemOtp.expiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Mark OTP as verified
        user.redeemOtp = null;
        user.otpVerified = true; // Set verification flag
        await user.save();

        // Step 3: Check if OTP is verified
        if (!user.otpVerified) {
            return res.status(400).json({ message: 'OTP verification required before redeeming' });
        }

        // Step 4: Check if user has enough points
        if (user.totalPoints < gift.points) {
            return res.status(400).json({
                error: 'Insufficient points',
                totalPoints: user.totalPoints,
                giftPoints: gift.points
            });
        }

        // Step 5: Find the offer associated with the gift
        let offer = await Offer.findOne({
            "gifts._id": giftIdObject,
            status: true
        });

        let offerName = offer ? offer.title : "Loyalty";
        let offerIdObject = offer ? offer._id : new mongoose.Types.ObjectId();

        // Step 6: Create the redeem request
        const newRedeemRequest = new RedeemRequest({
            user_id: user_id,
            gift_id: giftIdObject,
            offer_id: offerIdObject,
            points: gift.points,
            user_name: user.name,
            gift_name: gift.name,
            offer_name: offerName
        });

        await newRedeemRequest.save();

        // Step 7: Deduct points and reset OTP verification flag
        user.totalPoints -= gift.points;
        user.otpVerified = false; // Reset OTP verification after redeem
        await user.save();

        return res.status(201).json({ message: 'Redeem request sent successfully', data: newRedeemRequest });
    } catch (error) {
        console.error("Error processing redeem request:", error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};



exports.getRedeemHistory = async (req, res) => {
    try {
        const user_id = req.userId;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID could not be extracted from token' });
        }

        const userIdObject = new mongoose.Types.ObjectId(user_id);

        const redeemRequests = await RedeemRequest.find({ user_id: userIdObject })
            .populate('gift_id')
            .populate('offer_id')
            .sort({ redeemed_on: -1 });

        if (redeemRequests.length === 0) {
            return res.status(200).json({
                message: 'No redeem history available for you',
                day_ta: [],
                count: 0
            });
        }

        return res.status(200).json({
            message: 'Redeem history fetched successfully',
            day_ta: redeemRequests,
            count: redeemRequests.length
        });

    } catch (error) {
        console.error("Error fetching redeem history:", error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getScanHistory = async (req, res) => {
    try {
        const user_id = req.userId;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID could not be extracted from token' });
        }

        const userObjectId = new mongoose.Types.ObjectId(user_id);

        // Extract the fromDate and toDate from request body
        const { fromDate, toDate } = req.body;

        let dateFilter = {};

        // If fromDate and toDate are provided, add them to the filter
        if (fromDate && toDate) {
            const startDate = new Date(fromDate);
            const endDate = new Date(toDate);

            // Ensure end date is inclusive
            endDate.setHours(23, 59, 59, 999);

            // Format start and end date to match the 'scannedAt' format (YYYY-MM-DD HH:mm:ss)
            const formattedStartDate = startDate.toISOString().slice(0, 19).replace('T', ' ');
            const formattedEndDate = endDate.toISOString().slice(0, 19).replace('T', ' ');

            // Add date filter to match the 'scannedAt' field
            dateFilter = {
                'scannedBy.scannedAt': {
                    $gte: formattedStartDate,
                    $lte: formattedEndDate
                }
            };
        }

        // Query the database with the date filter along with the user ID and isScanned flag
        const scannedCoupons = await Coupon.find({
            'scannedBy.userId': userObjectId,
            isScanned: true,
            ...dateFilter
        })
        .sort({ 'scannedBy.scannedAt': -1 });

        if (scannedCoupons.length === 0) {
            return res.status(200).json({
                message: 'No scan history available for you',
                day_ta: [],
                count: 0
            });
        }

        return res.status(200).json({
            message: 'Scan history fetched successfully',
            day_ta: scannedCoupons,
            count: scannedCoupons.length
        });

    } catch (error) {
        console.error("Error fetching scan history:", error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

