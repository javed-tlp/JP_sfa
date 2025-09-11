const express = require("express");
const AdminController = require("../../controller/webCon/adminController");
const ProductController = require("../../controller/webCon/productController");
const CouponController = require("../../controller/webCon/couponController");
const CustomerController = require('../../controller/webCon/customerController');
const GiftController = require("../../controller/webCon/giftController");
const OfferController = require('../../controller/webCon/offerController');
const redeemRequestController = require('../../controller/webCon/redeemRequestController');
const dashboardController = require('../../controller/webCon/dashboardController')
const pincodeController = require('../../controller/webCon/pincodeController'); // Ensure this path is correct
const postalController = require('../../controller/webCon/postalController'); // Import your postalController
const SetupController = require("../../controller/webCon/setupController"); // Ensure you have this controller
const SalesUserController = require("../../controller/webCon/SalesUserController");
const SystemUserController = require("../../controller/webCon/systemUserController");





const verifyToken = require("../../middlewares/WebToken")


const { check, body } = require('express-validator');
const upload = require('../../middlewares/multerConfig');

const router = express.Router();

// System User Routes
router.post(
    '/system_admin',
    [
        check('limit')
            .exists().withMessage('Limit is required')
            .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
        check('start')
            .exists().withMessage('Start is required')
            .isInt({ min: 0 }).withMessage('Start must be a non-negative integer')
    ],
    AdminController.getSystemAdmins
);

router.post('/system_admin/add', [
    check('name').notEmpty().withMessage('Name is required'),
    check('mobile_no').notEmpty().withMessage('Mobile Number is required'),
    check('email').isEmail().withMessage('Invalid email'),
    check('role').notEmpty().withMessage('Role is required'),
    check('username').notEmpty().withMessage('Username is required'),
    check('password').notEmpty().withMessage('Password is required')
], AdminController.createSystemAdmin);

// Admin Profile Routes
router.post('/system_admin/profile', [
    check('_id').notEmpty().withMessage('Admin ID is required'),
], AdminController.getAdminProfile);  // Get Admin Profile


router.post('/system_admin/update', [
    check('user_id').notEmpty().withMessage('User ID is required'),
    check('name').optional().notEmpty().withMessage('Name cannot be empty'),
    check('mobile_no').optional().notEmpty().withMessage('Mobile Number cannot be empty'),
    check('email').optional().isEmail().withMessage('Invalid email'),
    check('role').optional().notEmpty().withMessage('Role cannot be empty'),
    check('username').optional().notEmpty().withMessage('Username cannot be empty'),
    check('password').optional().notEmpty().withMessage('Password cannot be empty')
], AdminController.updateSystemAdmin);

router.post('/system_admin/delete', [
    check('user_id').notEmpty().withMessage('User ID is required')
], AdminController.deleteSystemAdmin);

// User Authentication Routes
router.post('/login', [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required')
], AdminController.login);

router.post('/logout', AdminController.logout);

// Product Category Routes
router.post('/product/add_category', [
    check('name', 'Name is required').notEmpty(),
    check('code', 'Code is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('status', 'Status is required').notEmpty()
], ProductController.addProductCategory);

router.post('/product/get_all_categories', ProductController.getAllProductCategories);

router.post('/product/update_category', [
    check('_id').notEmpty().withMessage('Category ID (_id) is required'), // Use _id here
    check('name').optional().notEmpty(),
    check('code').optional().notEmpty(),
    check('description').optional().notEmpty(),
    check('status').optional().notEmpty()
], ProductController.updateProductCategory);  // Update a product category by _id


router.post('/product/delete_category', [
    check('_id').notEmpty().withMessage('Category ID (_id) is required') // Use _id here
], ProductController.deleteProductCategory);  // Delete a product category by _id


router.post('/product/add_subcategory', [
    check('_id', 'Category ID (_id) is required').notEmpty(),  // Use _id for validation
    check('name', 'Name is required').notEmpty(),
    check('description').optional(),
    check('status', 'Status is required').notEmpty()
], ProductController.addSubcategory);  // Add a subcategory


// Update Subcategory route
router.post('/product/update_subcategory', [
    check('_id').notEmpty().withMessage('Subcategory _id is required'),
    check('name').optional().notEmpty(),
    check('description').optional().notEmpty(),
    check('status').optional().notEmpty()
], ProductController.updateSubcategory);

// Delete Subcategory route
router.post('/product/delete_subcategory', [
    check('_id').notEmpty().withMessage('Subcategory _id is required')
], ProductController.deleteSubcategory);


router.post('/product/get_all_subcategories', ProductController.getAllSubcategories);

// Product Routes
router.post('/product/add', upload.single('image'), [
    check('subcategory_id').notEmpty().withMessage('Subcategory ID is required'),  // Expecting _id
    check('name').notEmpty().withMessage('Product Name is required'),
    check('price').isNumeric().withMessage('Price must be a number'),
    check('status').optional().isBoolean().withMessage('Status must be a boolean')
], ProductController.addProduct);  // Add a product with image



// Update product route (by _id)
router.post('/product/update', upload.single('image'), [
    check('_id').notEmpty().withMessage('Product ID (_id) is required'),  // _id is now mandatory
    check('name').optional().notEmpty(),
    check('price').optional().isNumeric().withMessage('Price must be a number'),
    check('status').optional().isBoolean().withMessage('Status must be a boolean')
], ProductController.updateProduct);

// Delete product route (by _id)
router.post('/product/delete', [
    check('_id').notEmpty().withMessage('Product ID (_id) is required')  // _id is now mandatory
], ProductController.deleteProduct);

router.post('/product/getById', [
    check('_id').notEmpty().withMessage('Product ID (_id) is required'),
], ProductController.getProductById);


// Product Routes - Get all products under a specific subcategory
router.post('/product/get_all', ProductController.getProductsBySubcategory); // No validation for subcategory_id
// Product Routes - Get _id and name of all active products
router.post('/product/list', ProductController.getProductIdAndName);



// Coupon Routes
router.post('/coupon/create', [
    check('product_id', 'Product ID is required').notEmpty(),
    check('number_of_coupons', 'Number of coupons is required').notEmpty(),
    check('carpenter_reward', 'Carpenter reward points are required').notEmpty(),
    check('expiry_date', 'Expiration date is required').notEmpty()
], CouponController.createCoupons);

router.post(
    '/coupon/get_all',
    [
        check('limit')
            .exists().withMessage('Limit is required')
            .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
        check('start')
            .exists().withMessage('Start is required')
            .isInt({ min: 0 }).withMessage('Start must be a non-negative integer')
    ],
    CouponController.getAllCoupons
);
router.post('/coupon/details', CouponController.getCouponDetailsById);
router.post('/coupon/reset',
    body('coupon_code')
        .isString()
        .notEmpty()
        .withMessage('Coupon code is required'),
        CouponController.resetCoupon
);
router.post('/coupon/export', CouponController.downloadCouponsExcel);




router.post('/customer/add', upload.single('profile_picture'), [
    check('name').notEmpty().withMessage('Name is required'),
    check('mobile_no').notEmpty().withMessage('Mobile Number is required'),
    check('email').isEmail().withMessage('Invalid email'),
    check('trade_id').isString({ min: 1, max: 3 }).withMessage('Invalid trade ID'),
], CustomerController.addCustomer);

// check('_id').notEmpty().withMessage('Customer ID (_id) is required'),
// Additional field validations

router.post('/customer/update/:_id', upload.single('profile_picture'), [
    check('_id').notEmpty().withMessage('Customer ID (_id) is required'),
    check('name').notEmpty().withMessage('Name is required'),
    check('mobile_no').notEmpty().withMessage('Mobile Number is required'),
    check('email').isEmail().withMessage('Invalid email'),
    check('trade_id').isString({ min: 1, max: 3 }).withMessage('Invalid trade ID'),
], CustomerController.updateCustomer);



router.post('/customer/delete', [
    check('_id').notEmpty().withMessage('Customer ID (_id) is required')
], CustomerController.deleteCustomer);

router.post('/customer/getById', [
    check('_id').notEmpty().withMessage('Customer ID (_id) is required')
], CustomerController.getCustomerById);




router.post(
    '/customer/get_all',
    [
        check('limit')
            .exists().withMessage('Limit is required')
            .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
        check('start')
            .exists().withMessage('Start is required')
            .isInt({ min: 0 }).withMessage('Start must be a non-negative integer')
    ],
    CustomerController.getAllCustomers
);


// Add a new gift with image
router.post('/gift/add', upload.single('image'), [
    check('name', 'Name is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('points', 'Points are required').isNumeric() // Add points validation
], GiftController.addGift);


// Update an existing gift
router.post('/gift/update', upload.single('image'), [
    check('_id', 'Gift ID is required').notEmpty(),
    check('name').optional().notEmpty(),
    check('description').optional().notEmpty(),
    check('points').optional().isNumeric() // Add points validation
], GiftController.updateGift);

// Soft delete a gift
router.post('/gift/delete', [
    check('_id').notEmpty().withMessage('Gift ID is required')
], GiftController.deleteGift);

// Get all active gifts
router.post('/gift/details', [
    check('_id').notEmpty().withMessage("Gift ID is required")
], GiftController.giftdetails);

router.post('/gift/get_all', [
    check('limit').exists().withMessage('Limit is required').isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    check('start').exists().withMessage('Start is required').isInt({ min: 0 }).withMessage('Start must be a non-negative integer')
], GiftController.getAllGifts);

// Create a new offer
router.post('/offers/add', [
    check('title', 'Title is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601(),
    // check('pointsRequired', 'Points required is required').isInt({ gt: 0 }),
], OfferController.createOffer);

router.post('/offers/get_all', OfferController.getAllOffers);
router.post('/offers/export', OfferController.downloadOffersExcel);


router.post('/offers/details', [
    check('_id').notEmpty().withMessage("Offer ID (_id) is required")
], OfferController.getOfferById);

router.post('/offers/update', [
    check('_id').notEmpty().withMessage("Offer ID (_id) is required")
], OfferController.updateOffer);

router.post('/offers/delete', [
    check('_id').notEmpty().withMessage("Offer ID (_id) is required")
], OfferController.deleteOffer);

// redeem request routes 
router.post('/redeem-request/status', redeemRequestController.updateRedeemRequestStatus);
// Redeem Request Routes
router.post('/redeem-requests/get_all', redeemRequestController.getAllRedeemRequests);


router.post('/dashboard', dashboardController.dashboardData)

router.post('/import-pincode', pincodeController.importPincodeData);

router.post(
    '/postal-details',
    [
        body('pincode').isNumeric().withMessage('Pincode must be a number')
    ],
    postalController.fetchPostalDetailsByPincode
);

router.post('/get-states-list', postalController.fetchStatesList);
router.post('/get-districts-list', postalController.fetchDistrictsList);
router.post('/get-cities-list', postalController.fetchCitiesList);
router.post('/get-offices-list', postalController.fetchPostOfficesList);

router.post('/video/add', upload.single('thumbnail'), [
    check('name').notEmpty().withMessage('Name is required'),
    check('description').optional(),
    check('link').isURL().withMessage('Valid link is required'),
    check('status').optional().isBoolean().withMessage('Status must be a boolean'),
], SetupController.addVideo);

router.post('/video/update', [
    check('_id').notEmpty().withMessage('Video ID (_id) is required'),
    check('name').optional().notEmpty().withMessage('Name cannot be empty'),
    check('description').optional(),
    check('link').optional().isURL().withMessage('Valid link is required'),
    check('status').optional().isBoolean().withMessage('Status must be a boolean')
], SetupController.updateVideo);

router.post('/video/delete', [
    check('_id').notEmpty().withMessage('Video ID (_id) is required')
], SetupController.deleteVideo);

router.post('/video/details', [
    check('_id').notEmpty().withMessage('Video ID (_id) is required')
], SetupController.getVideoDetails);

router.post('/video/get_all', SetupController.getAllVideos);

// Add banner route
router.post('/banner/add', upload.single('image_path'), [
    check('title').notEmpty().withMessage('Title is required'),
], SetupController.addBannerData); // Handle banner addition in SetupController

// Update Banner route
router.post('/banner/update', [
    check('_id').notEmpty().withMessage('Banner ID (_id) is required'),
    check('title').optional().notEmpty().withMessage('Title cannot be empty'),
], SetupController.updateBanner);

// Delete Banner route
router.post('/banner/delete', [
    check('_id').notEmpty().withMessage('Banner ID (_id) is required')
], SetupController.deleteBanner);

// Get All Banners route
router.post('/banner/get_all', SetupController.getAllBanners);


// Sales User Routes
router.post('/sales_user/add', [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Invalid email'),
    check('mobile_no').notEmpty().withMessage('Mobile number is required'),
], SalesUserController.addSalesUser);

router.post('/sales_user/update', [
  check('sales_user_id').notEmpty().withMessage('Sales User ID is required'),
], SalesUserController.updateSalesUser);


router.post('/sales_user/delete', [
    check('_id').notEmpty().withMessage('User ID is required'),
], SalesUserController.deleteSalesUser);

router.post('/sales_user/get_all', SalesUserController.getAllSalesUsers);

router.post('/sales_user/getById', [
    check('_id').notEmpty().withMessage('User ID is required'),
], SalesUserController.getSalesUserById);


router.post("/system_user/add", [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Valid email is required"),
  check("password").notEmpty().withMessage("Password is required"),
], SystemUserController.addSystemUser);

router.post("/system_user/assign_modules", [
  check("system_user_id").notEmpty().withMessage("System User ID is required"),
  check("assigned_modules").isArray().withMessage("Modules must be an array"),
], SystemUserController.assignModules);

router.post("/system_user/getById", [
  check("system_user_id").notEmpty().withMessage("System User ID is required"),
], SystemUserController.getSystemUserById);

module.exports = router;
