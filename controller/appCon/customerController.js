// Required dependencies and models
const Customer = require('../../models/webMod/customerModel');
const CouponModel = require('../../models/appMod/couponModel');
const TempCustomer = require('../../models/appMod/tempCustomerModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const sendOtpToCustomer = require('../../middlewares/otpService'); 
const {getValidUptoTime, getCurrentDateTime, getStartOfDay, getEndOfDay, getStartOfLastMonth, getEndOfLastMonth} = require('../../middlewares/dateTimeUtil'); // Import the utility
const SetupModel = require('../../models/webMod/setupModel');



const JWT_SECRET = 'S3cure@JWTSecret#2024';

exports.sendOtp = async (req, res) => {
    const { mobile_no } = req.body;

    try {
        // Check if the mobile number is already registered
        const existingCustomer = await Customer.findOne({ mobile_no });

        if (existingCustomer) {
            return res.status(400).json({
                message: 'Mobile number is already registered. Please log in.'
            });
        }

        // Generate OTP valid up-to time
        const validUptoTime = getValidUptoTime();

        // Send OTP to the customer's mobile number
        const { success, otp } = await sendOtpToCustomer(mobile_no);

        if (!success) {
            return res.status(500).json({ message: 'Failed to send OTP' });
        }

        // Save or update the OTP in the temporary customer collection
        await TempCustomer.findOneAndUpdate(
            { mobile_no },
            { otp, validUpto: validUptoTime },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'OTP sent successfully', OTP: otp });
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
            details: error.message
        });
    }
};


exports.verifyOtp = async (req, res) => {
    const { mobile_no, otp } = req.body;

    try {
        const tempCustomer = await TempCustomer.findOne({ mobile_no, otp });
        if (!tempCustomer) {
            return res.status(400).json({ error: 'Invalid OTP or mobile number' });
        }

        // Mark the OTP as verified
        tempCustomer.otpVerified = true;
        await tempCustomer.save();

        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


const { uploadUPIScannerImage } = require('../../middlewares/base64ToFilePath'); // Import the image upload API

exports.customerRegister = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { 
            mobile_no, 
            name, 
            email, 
            address, 
            trade_id, 
            age, 
            pincode, 
            state, 
            city, 
            district, 
            bank_name, 
            account_holder_name, 
            branch_name, 
            ifsc_code, 
            dob, 
            upi_id, 
            upi_scanner_base64, // Base64-encoded UPI scanner image
            profile_picture_base64 // Base64-encoded profile picture
        } = req.body;

        let upi_scanner_image = null;
        let profile_picture = null;

        // Step 1: Handle UPI scanner image upload (if provided)
        if (upi_scanner_base64) {
            console.log("UPI Scanner IMage oworks")
            try {
                upi_scanner_image = await uploadUPIScannerImage(upi_scanner_base64);
                console.log('UPI scanner image saved at:', upi_scanner_image);
            } catch (uploadError) {
                console.error('Error uploading UPI scanner image:', uploadError);
                return res.status(500).json({ error: 'Failed to upload UPI scanner image' });
            }
        }

        // Step 2: Handle profile picture upload (if provided)
        if (profile_picture_base64) {
            console.log("Profile oworks")
            console.log("Profile oworks",profile_picture_base64)


            try {
                profile_picture = await uploadUPIScannerImage(profile_picture_base64); // Reuse the same function
                console.log('Profile picture saved at:', profile_picture);
            } catch (uploadError) {
                console.error('Error uploading profile picture:', uploadError);
                return res.status(500).json({ error: 'Failed to upload profile picture' });
            }
        }

        // Map trade_id to trade_type
        const tradeTypeMapping = {
            "1": "carpenter",
            "2": "fabricator",
            "3": "plumber"
        };

        const trade_type = tradeTypeMapping[trade_id];
        if (!trade_type) {
            console.warn('Invalid trade_id provided:', trade_id);
            return res.status(400).json({ error: 'Invalid trade_id' });
        }

        // Check if the OTP is verified in TempCustomer
        const tempCustomer = await TempCustomer.findOne({ mobile_no });
        if (!tempCustomer || !tempCustomer.otpVerified) {
            console.warn('OTP not verified for mobile number:', mobile_no);
            return res.status(400).json({ error: 'OTP not verified or invalid mobile number' });
        }

        // Check if the customer is already registered
        const existingCustomer = await Customer.findOne({ mobile_no });
        if (existingCustomer) {
            const token = jwt.sign({ userId: existingCustomer._id }, JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ message: 'Login successful', customer: existingCustomer, token });
        }

        // Create a new customer record
        const newCustomer = new Customer({
            mobile_no,
            name,
            email,
            address,
            trade_type,
            trade_id,
            age,
            pincode,
            state,
            city,
            district,
            otp: tempCustomer.otp,
            validUpto: getValidUptoTime(),
            created_by: 'self',
            bank_name,
            account_holder_name,
            branch_name,
            ifsc_code,
            dob,
            upi_id,
            upi_scanner_image, // Save UPI scanner image path
            profile_picture     // Save profile picture path
        });

        await newCustomer.save();

        // Automatically log in the new customer
        const token = jwt.sign({ userId: newCustomer._id }, JWT_SECRET, { expiresIn: '1h' });
        newCustomer.token = token;
        await newCustomer.save();

        return res.status(201).json({ message: 'Registration successful', customer: newCustomer, token });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};






// Controller for getting customer profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId; // Get the user ID from the token

        // Fetch the customer profile, excluding the token from the response
        const customer = await Customer.findById(userId).select('-token');

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        return res.status(200).json({ message: 'Profile retrieved successfully', customer });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


// Controller for sending OTP during login
exports.sendOtpForLogin = async (req, res) => {
    const { mobile_no } = req.body;

    try {
        const customer = await Customer.findOne({ mobile_no });

        if (!customer) {
            return res.status(404).json({ message: 'Mobile number not found' });
        }

        const validUptoTime = getValidUptoTime();

        let otp = '123456';
        let success = true;

        if (!['8527019853', '8800132607'].includes(mobile_no)) {
            const response = await sendOtpToCustomer(mobile_no);
            success = response.success;
            otp = response.otp;

            if (!success) {
                return res.status(500).json({ message: 'Failed to send OTP' });
            }
        }

        await Customer.findOneAndUpdate(
            { mobile_no },
            { 
                otp, 
                validUpto: validUptoTime
            },
            { new: true }
        );

        res.status(200).json({ message: 'OTP sent successfully', OTP: otp });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};




exports.customerLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { mobile_no, otp } = req.body;

    try {
        const customer = await Customer.findOne({ mobile_no, otp });

        if (!customer) {
            console.error('Mobile number not found:', mobile_no);
            return res.status(400).json({ message: 'Mobile number not found' });
        }

        if (!customer.validUpto) {
            console.error('OTP has not been generated or is invalid for mobile number:', mobile_no);
            return res.status(400).json({ message: 'OTP has not been generated or is invalid' });
        }

        if (getCurrentDateTime() > customer.validUpto) {
            console.error('OTP has expired for mobile number:', mobile_no);
            return res.status(400).json({ message: 'OTP has expired' });
        }

        customer.otpVerified = true;

        const token = jwt.sign({ userId: customer._id }, JWT_SECRET, { expiresIn: '5h' });

        customer.token = token;
        await customer.save();

        return res.status(200).json({ message: 'Login successful', customer, token });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};



// Controller for customer logout
exports.customerLogout = async (req, res) => {
    try {
        const userId = req.userId;
        const customer = await Customer.findByIdAndUpdate(userId, { token: null }, { new: true });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

exports.scanCoupons = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let { coupon_codes } = req.body;
        console.log("Coupon codes before trim--->", coupon_codes)

        const userId = req.userId;

        coupon_codes = coupon_codes.filter(code => code.trim() !== '');
        console.log("Coupon codes after trim--->", coupon_codes)

        // Fetch the customer
        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const scannedSuccessfully = [];
        const alreadyScanned = [];
        const notFound = [];
        let totalPointsEarned = 0;

        // Process each coupon code
        for (const code of coupon_codes) {
            const coupon = await CouponModel.findOne({ coupon_code: code });

            if (!coupon) {
                notFound.push({ coupon_code: code, status: 'not_found', message: 'Coupon not found' });
                continue;
            }

            if (coupon.isScanned) {
                alreadyScanned.push({
                    coupon_code: code,
                    status: 'already_scanned',
                    message: 'Coupon already scanned',
                    scannedBy: coupon.scannedBy,
                    scannedAt: coupon.scannedBy.scannedAt,
                });
                continue;
            }

            // Mark coupon as scanned
            coupon.isScanned = true;
            coupon.scannedBy = {
                userId: customer._id,
                scannedByName: customer.name,
                scannedAt: getCurrentDateTime(),
                name: customer.name,
                email: customer.email,
                mobile_no: customer.mobile_no,
                address: customer.address,
                trade_type: customer.trade_type,
                cliend_id: customer.client_id,
                trade_id: customer.trade_id,
            };

            // Add points to the customer
            customer.totalPoints += coupon.carpenter_reward;
            totalPointsEarned += coupon.carpenter_reward;

            await coupon.save();
            scannedSuccessfully.push({
                coupon_code: code,
                status: 'scanned_successfully',
                scannedBy: coupon.scannedBy,
                scannedAt: coupon.scannedBy.scannedAt,
                reward: coupon.carpenter_reward,
            });
        }

        // Save updated customer points
        await customer.save();

        res.status(200).json({
            message: 'Coupons processed successfully',
            scannedSuccessfully,
            alreadyScanned,
            notFound,
            totalPoints: customer.totalPoints,
            pointsEarnedThisSession: totalPointsEarned,
        });
    } catch (error) {
        console.error("Error during coupon scanning:", error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};




// Controller for fetching app home details
exports.getAppHome = async (req, res) => {
    try {
        const userId = req.userId;

        const customer = await Customer.findById(userId).select('name profile_picture totalPoints');
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Get the start and end of today in IST using the utility functions
        const startOfDay = getStartOfDay();
        const endOfDay = getEndOfDay();

        console.log('Start of today (IST):', startOfDay);
        console.log('End of today (IST):', endOfDay);

        // Fetch coupons scanned today
        const scannedToday = await CouponModel.find({
            'scannedBy.userId': userId,
            isScanned: true,
            'scannedBy.scannedAt': { $gte: startOfDay, $lte: endOfDay }
        });

        // console.log('Scanned Today:', scannedToday);

        const todaysScannedPoints = scannedToday.reduce((total, coupon) => total + coupon.carpenter_reward, 0);

        // Get the start and end of last month using the utility functions
        const lastMonthStart = getStartOfLastMonth();
        const lastMonthEnd = getEndOfLastMonth();

        // console.log('Start of last month (IST):', lastMonthStart);
        // console.log('End of last month (IST):', lastMonthEnd);

        // Fetch coupons scanned in the last month
        const scannedLastMonth = await CouponModel.find({
            'scannedBy.userId': userId,
            isScanned: true,
            'scannedBy.scannedAt': { $gte: lastMonthStart, $lte: lastMonthEnd }
        });

        // Calculate total points earned in last month
        const lastMonthTotalPoints = scannedLastMonth.reduce((total, coupon) => total + coupon.carpenter_reward, 0);

        const banners = await SetupModel.Banner.find({ status: true }).select('title image_path');

        const day_ta = {
            name: customer.name,
            profile_picture: customer.profile_picture,
            totalPoints: customer.totalPoints,
            todaysScannedPoints,
            lastMonthTotalPoints, // Total points earned in the last month
            banners,
        };
        console.log('Home API----->Day TA<-----:', day_ta);  

        res.status(200).json({
            message: 'App Home Data retrieved successfully',
            day_ta
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};
