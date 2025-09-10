const express = require('express');
const { body, check } = require('express-validator');
const router = express.Router();
const customerController = require('../../controller/appCon/customerController');
const OfferController = require('../../controller/appCon/offerController');
const RedeemController = require('../../controller/appCon/redeemController');
const postalController = require('../../controller/appCon/postalController'); // Import your postalController
const appToken = require('../../middlewares/AppToken');
const upload = require('../../middlewares/multerConfig')

// Customer registration route
router.post(
    '/register',
    upload.fields([
        { name: 'upi_scanner_image', maxCount: 1 }, // Handle UPI scanner image upload
        { name: 'profile_picture', maxCount: 1 },   // Handle profile picture upload
    ]),
    body('mobile_no')
        .isString()
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number must be exactly 10 digits long and numeric')
        .isNumeric(),
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    customerController.customerRegister
);

// Route to send OTP
router.post('/send_otp_to_register',
    body('mobile_no')
        .isString()
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number must be exactly 10 digits long and numeric')
        .isNumeric(),
    customerController.sendOtp
);

// Route to verify OTP
router.post('/verify_otp_to_register',
    body('mobile_no')
        .isString()
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number must be exactly 10 digits long and numeric')
        .isNumeric(),
    body('otp')
        .isString()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be exactly 6 digits long and numeric')
        .isNumeric(),
    customerController.verifyOtp
);



// Route to send OTP for login
router.post('/send_otp_to_login', [
    body('mobile_no')
        .isString()
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number must be exactly 10 digits long and numeric')
        .isNumeric(),
], customerController.sendOtpForLogin);

// Customer login route
router.post('/login', [
    body('mobile_no')
        .isString()
        .isLength({ min: 10, max: 10 })
        .withMessage('Mobile number must be exactly 10 digits long and numeric')
        .isNumeric(),
    body('otp')
        .isString()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be exactly 6 digits long and numeric')
        .isNumeric(),
], customerController.customerLogin);

// Logout route
router.post('/logout', appToken.verifyToken, customerController.customerLogout);

// Protected route example
router.get('/protected_route', appToken.verifyToken, (req, res) => {
    res.status(200).json({ message: 'You have access to this protected route', userId: req.userId });
});

// Coupon scanning route
router.post('/scan_coupons',
    appToken.verifyToken,
    body('coupon_codes')
        .isArray({ min: 1 })
        .withMessage('Coupon codes must be an array with at least one item'),
    body('coupon_codes.*')
        .isString(),
    customerController.scanCoupons
);


// Get all active offers (for app)
router.post('/offers', OfferController.getActiveOffers);

// Route to get customer profile
router.post('/profile', appToken.verifyToken, customerController.getProfile);

// Route for getting app home details
router.post('/home', appToken.verifyToken, customerController.getAppHome);


router.post('/gift', OfferController.getallgift);

router.post('/gift/details', [
    check('_id').notEmpty().withMessage('Gift ID (_id) is required')
], OfferController.getgiftDetails);

// Route to send OTP for redeem
router.post(
    '/send_otp_to_redeem',
    appToken.verifyToken,
    RedeemController.sendOtpForRedeem
);

router.post('/redeem/request',
    appToken.verifyToken,
    [
        body('gift_id')
            .isString()
            .isLength({ min: 24, max: 24 })
            .withMessage('Gift ID must be a valid 24-character ObjectId'),
        body('otp')
            .isNumeric()
            .isLength({ min: 6, max: 6 })
            .withMessage('OTP must be a 6-digit number')
    ],
    RedeemController.redeemRequest
);


router.post('/redeem/history',appToken.verifyToken, RedeemController.getRedeemHistory);

router.post('/scan/history',appToken.verifyToken, RedeemController.getScanHistory);


router.post(
    '/postal-details',
    [
        body('pincode').isNumeric().withMessage('Pincode must be a number')
    ],
    postalController.fetchPostalDetailsByPincode
);


module.exports = router;
