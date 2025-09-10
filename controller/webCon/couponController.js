const { validationResult } = require('express-validator');
const CouponModel = require('../../models/webMod/newCouponModel'); // Updated model path
const Product = require('../../models/webMod/productModel'); // Adjust the product model path as necessary
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility for date-time formatting
const CustomerModel = require("../../models/webMod/customerModel")

exports.createCoupons = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Invalid input data',
            status: 'error',
            errors: errors.mapped()
        });
    }

    try {
        const { number_of_coupons, product_id, carpenter_reward, fabricator_reward, expiry_date } = req.body; // Destructure the needed fields

        // Validate the product by _id
        const product = await Product.ProductData.findOne({ _id: product_id }); // Query by _id
        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                status: "error"
            });
        }

        const generatedCoupons = [];

        // Create and save each coupon individually
        for (let i = 0; i < parseInt(number_of_coupons); i++) {
            const uniqueCouponCode = generateUniqueString(10); // Function to generate a unique coupon code
            const newCoupon = new CouponModel({
                coupon_reference: `REF-${generateUniqueString(8)}`, // Generate a unique coupon reference
                coupon_code: uniqueCouponCode,
                product_id: product._id, // Use the MongoDB _id field
                product_name: product.name, // Store the product name
                carpenter_reward: carpenter_reward,
                fabricator_reward: fabricator_reward,
                expiry_date: expiry_date, // Ensure expiry_date is a Date object
                created_on: getCurrentDateTime(), // Set the created_on using the utility function
                updated_on: getCurrentDateTime(), // Set the updated_on using the utility function
                isScanned: false, // Set isScanned to false by default
                isActive: true    // Set isActive to true by default
            });

            // Save each coupon
            await newCoupon.save();
            generatedCoupons.push(newCoupon); // Store the saved coupon
        }

        if (generatedCoupons.length) {
            // Include product name in the response
            res.status(201).json({
                message: "Coupons successfully created",
                status: "success",
                day_ta: generatedCoupons.map(coupon => ({
                    product_name: coupon.product_name, // Product name stored in the coupon
                    coupon_id: coupon.coupon_id,
                    coupon_code: coupon.coupon_code,
                    coupon_reference: coupon.coupon_reference,
                    product_id: coupon.product_id,
                    carpenter_reward: coupon.carpenter_reward,
                    fabricator_reward: coupon.fabricator_reward,
                    expiry_date: coupon.expiry_date,
                    isScanned: coupon.isScanned, // Include isScanned in response
                    isActive: coupon.isActive
                })),
            });
        } else {
            res.status(400).json({
                message: "No coupons were created",
                status: "failed",
            });
        }
    } catch (error) {
        console.error("Error during coupon creation:", error);
        res.status(500).json({
            message: "An error occurred while creating coupons",
            status: "error",
            error: { code: error.code, message: error.message }
        });
    }
};

// Function to create the coupon filter
const createCouponFilter = (body) => {
    const filter = {};

    if (body.coupon_code) {
        filter.coupon_code = new RegExp(body.coupon_code, 'i'); // Case-insensitive search for coupon_code
    }

    if (body.product_name) {
        filter.product_name = new RegExp(body.product_name, 'i'); // Case-insensitive search for product_name
    }

    if (body.coupon_reference) {
        filter.coupon_reference = new RegExp(body.coupon_reference, 'i'); // Case-insensitive search for coupon_reference
    }

    if (body.product_id) {
        filter.product_id = body.product_id; // Exact match for product_id
    }

    if (body.isActive !== undefined) {
        filter.isActive = body.isActive; // Filter by isActive (true or false)
    }

    if (body.isScanned !== undefined) {
        filter.isScanned = body.isScanned; // Filter by isScanned (true or false)
    }

    if (body.expiry_date) {
        filter.expiry_date = body.expiry_date; // Exact match for expiry_date
    }

    // Date range filter for created_on (startDate and endDate)
    if (body.startDate || body.endDate) {
        filter.created_on = {};

        if (body.startDate) {
            const startDateStr = body.startDate + ' 00:00:00';
            filter.created_on.$gte = startDateStr; // Greater than or equal to startDate
        }

        if (body.endDate) {
            const endDateStr = body.endDate + ' 23:59:59';
            filter.created_on.$lte = endDateStr; // Less than or equal to endDate
        }

        if (Object.keys(filter.created_on).length === 0) {
            delete filter.created_on;
        }
    }

    return filter;
};



exports.getAllCoupons = async (req, res) => {
    try {
        const { start = 0, limit = 20 } = req.body; // Default values for pagination
        const filter = createCouponFilter(req.body);

        // Fetch coupons based on the filter, start, and limit
        const coupons = await CouponModel.find(filter)
            .skip(Number(start))
            .limit(Number(limit));

        // Get the total count of coupons that match the filter
        const totalCoupons = await CouponModel.countDocuments(filter);

        res.status(200).json({
            success: true,
            coupons: coupons,
            totalCoupons: totalCoupons
        });

    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong on the server.',
            error: error.message
        });
    }
};


exports.getCouponDetailsById = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({
                success: false,
                message: 'Coupon ID (_id) is required.'
            });
        }

        // Fetch the coupon using the MongoDB _id
        const coupon = await CouponModel.findById(_id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found.'
            });
        }

        res.status(200).json({
            success: true,
            coupon: coupon
        });

    } catch (error) {
        console.error('Error fetching coupon by _id:', error);
        res.status(500).json({
            success: false,
            message: 'Something went wrong on the server.',
            error: error.message
        });
    }
};


const ExcelJS = require('exceljs');
// const CouponModel = require('../../models/Coupon'); // Ensure correct import path for CouponModel

exports.downloadCouponsExcel = async (req, res) => {
    try {
        console.log("Starting the Excel export for coupons...");

        // Fetch the coupons from the database
        const coupons = await CouponModel.find();
        console.log(`Coupons fetched: ${coupons.length} coupons found.`);

        if (!coupons || coupons.length === 0) {
            console.log("No coupons found to export.");
            return res.status(404).json({ message: 'No coupons found to export.' });
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Coupons');
        console.log("Excel workbook and worksheet created.");

        // Define columns for the Excel sheet
        worksheet.columns = [
            { header: 'Coupon ID', key: 'coupon_id', width: 15 },
            { header: 'Product Name', key: 'product_name', width: 20 },
            { header: 'Coupon Reference', key: 'coupon_reference', width: 25 },
            { header: 'Coupon Code', key: 'coupon_code', width: 20 },
            { header: 'Product ID', key: 'product_id', width: 20 },
            { header: 'Carpenter Reward', key: 'carpenter_reward', width: 15 },
            { header: 'Fabricator Reward', key: 'fabricator_reward', width: 15 },
            { header: 'Expiry Date', key: 'expiry_date', width: 20 },
            { header: 'Created On', key: 'created_on', width: 20 },
            { header: 'Updated On', key: 'updated_on', width: 20 },
            { header: 'Is Scanned', key: 'isScanned', width: 10 },
            { header: 'Is Active', key: 'isActive', width: 10 },
            { header: 'Scanned By Name', key: 'scannedByName', width: 20 },
            { header: 'Scanned By Email', key: 'scannedByEmail', width: 25 },
            { header: 'Scanned By Mobile', key: 'scannedByMobile', width: 20 },
            { header: 'Scanned At', key: 'scannedAt', width: 20 }
        ];
        console.log("Excel columns defined.");

        // Add data rows
        coupons.forEach((coupon) => {
            const row = worksheet.addRow({
                coupon_id: coupon.coupon_id,
                product_name: coupon.product_name,
                coupon_reference: coupon.coupon_reference,
                coupon_code: coupon.coupon_code,
                product_id: coupon.product_id,
                carpenter_reward: coupon.carpenter_reward,
                fabricator_reward: coupon.fabricator_reward,
                expiry_date: coupon.expiry_date,
                created_on: coupon.created_on,
                updated_on: coupon.updated_on,
                isScanned: coupon.isScanned ? 'Yes' : 'No',
                isActive: coupon.isActive ? 'Active' : 'Inactive',
                // Adding scannedBy details if available
                scannedByName: coupon.scannedBy?.scannedByName || '',
                scannedByEmail: coupon.scannedBy?.email || '',
                scannedByMobile: coupon.scannedBy?.mobile_no || '',
                scannedAt: coupon.scannedBy?.scannedAt || ''
            });

            // If the coupon is scanned, apply a background color
            if (coupon.isScanned) {
                row.eachCell((cell, colNumber) => {
                    cell.style = {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFF00' } // Yellow color for scanned coupons
                        }
                    };
                });
            }
        });
        console.log("Coupon data rows added to the worksheet.");

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Coupons.xlsx"');
        console.log("Response headers set for download.");

        // Write the workbook to the response
        await workbook.xlsx.write(res);
        console.log("Workbook written to response.");
        res.end();
    } catch (error) {
        console.error('Error exporting coupons:', error);
        res.status(500).json({ error: 'Failed to export coupons', details: error.message });
    }
};










// Helper function to generate a unique string
function generateUniqueString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


exports.resetCoupon = async (req, res) => {
    try {
        const { coupon_code } = req.body;

        // Find the coupon and populate scannedBy.userId
        const coupon = await CouponModel.findOne({ coupon_code })
            .populate({ path: 'scannedBy.userId', strictPopulate: false });

        if (!coupon) return res.status(404).json({ error: 'Coupon not found' });

        if (!coupon.isScanned) return res.status(400).json({ message: 'Coupon has not been scanned yet' });

        if (!coupon.scannedBy || !coupon.scannedBy.userId) {
            return res.status(400).json({ message: 'No valid scanned user data found for this coupon' });
        }

        const customer = coupon.scannedBy.userId;

        // Deduct coupon points from customer's total points
        customer.totalPoints = Math.max(0, customer.totalPoints - (coupon.carpenter_reward || 0));
        await customer.save();

        // Reset coupon details
        coupon.isScanned = false;
        coupon.scannedBy = null;
        await coupon.save();

        res.status(200).json({
            message: 'Coupon has been reset successfully',
            customer: { _id: customer._id, name: customer.name, totalPoints: customer.totalPoints },
            coupon: { coupon_id: coupon.coupon_id, coupon_code: coupon.coupon_code, isScanned: coupon.isScanned },
        });
    } catch (error) {
        console.error('Error during coupon reset:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};










