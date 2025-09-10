const { validationResult } = require('express-validator');
const Customer = require('../../models/webMod/customerModel');
const mongoose = require('mongoose');
const { fetchLocationDetailsByPostalCodeGeoNames } = require('../../middlewares/locationUtils'); // Adjust the path as necessary
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility
const { ObjectId } = require('mongoose').Types;





const getTradeType = (trade_id) => {
    switch (trade_id) {
        case '1':
            return 'carpenter';
        case '2':
            return 'fabricator';
        case '3':
            return 'plumber';
        default:
            throw new Error('Invalid trade_id');
    }
};


exports.addCustomer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, mobile_no, email, pincode, age, address, trade_id, city, district, state} = req.body;

        // const locationDetails = await fetchLocationDetailsByPostalCodeGeoNames(postal_code);
        const trade_type = getTradeType(trade_id);

        const existingCustomer = await Customer.findOne({ mobile_no });
        if (existingCustomer) {
            return res.status(400).json({ error: 'Customer already registered with this mobile number' });
        }

        const profile_picture = req.file ? req.file.path.replace(/\\/g, '/') : null;
        console.log(profile_picture)

        const newCustomer = new Customer({
            name,
            mobile_no,
            email,
            trade_type,
            trade_id,
            pincode,
            city,
            district,
            state,
            age,
            kyc_status: 'accepted',
            created_by: 'admin',
            address,
            profile_picture
        });

        await newCustomer.save();

        return res.status(201).json({ message: 'Customer added successfully', day_ta: newCustomer });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.updateCustomer = async (req, res) => {
    const { _id } = req.params; // Retrieve _id from route parameters
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log("Validation Errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        console.log("Request Body:", req.body);
        console.log("Received Customer ID (_id):", _id);

        // Extract fields from the request body
        const { name, mobile_no, email, trade_id, address, age, kyc_status, pincode, city, district, state } = req.body;

        console.log("Extracted Fields:", { name, mobile_no, email, trade_id, address, age, kyc_status, pincode, city, district, state });

        // Calculate trade type if trade_id is provided
        const trade_type = trade_id ? getTradeType(trade_id) : undefined;
        console.log("Determined Trade Type:", trade_type);

        // Check if a new profile picture is uploaded
        let profile_picture = req.file ? req.file.path.replace(/\\/g, '/') : undefined;
        console.log("Uploaded Profile Picture:", profile_picture);

        // Construct the update data object
        const updateData = {
            name,
            mobile_no,
            email,
            trade_id,
            trade_type,
            pincode,
            city,
            district,
            state,
            address,
            age,
            kyc_status,
            updated_on: getCurrentDateTime(),
        };

        // If there's a new profile picture, include it in the update data
        if (profile_picture) {
            updateData.profile_picture = profile_picture;
        }

        console.log("Update Data Object:", updateData);

        // Update the customer document
        const updatedCustomer = await Customer.findOneAndUpdate(
            { _id }, // Match customer by _id
            updateData,
            { new: true, runValidators: true } // Return the updated document and validate inputs
        );

        if (!updatedCustomer) {
            console.log("Customer Not Found for ID:", _id);
            return res.status(404).json({ error: 'Customer not found' });
        }

        console.log("Updated Customer Data:", updatedCustomer);

        // Respond with success
        return res.status(200).json({
            message: 'Customer updated successfully',
            data: updatedCustomer,
        });
    } catch (error) {
        console.error("Server Error:", error.message);
        return res.status(500).json({
            error: 'Server error',
            details: error.message,
        });
    }
};




const createCustomerFilter = (body) => {
    const filter = { status: true };

    if (body.name) {
        filter.name = new RegExp(body.name, 'i');
    }
    if (body.mobile_no) {
        filter.mobile_no = new RegExp(`^${body.mobile_no}`, 'i');
    }
    if (body.postal_code) {
        filter.postal_code = new RegExp(`^${body.postal_code}`, 'i');
    }
    if (body.email) {
        filter.email = new RegExp(`^${body.email}`, 'i');
    }
    if (body.trade_id) {
        filter.trade_id = body.trade_id;
    }
    if (body.trade_type) {
        filter.trade_type = new RegExp(`^${body.trade_type}`, 'i');
    }
    if (body.address) {
        filter.address = new RegExp(body.address, 'i');
    }
    if (body.age !== undefined) {
        filter.age = body.age;
    }
    if (body.kyc_status) {
        filter.kyc_status = new RegExp(body.kyc_status, 'i');
    }
    if (body.created_by) {
        filter.created_by = new RegExp(body.created_by, 'i');
    }
    if (body.totalPoints !== undefined) {
        filter.totalPoints = body.totalPoints;
    }

    if (body.startDate || body.endDate) {
        filter.created_on = {};
        
        if (body.startDate) {
            const startDateStr = body.startDate + ' 00:00:00';
            filter.created_on.$gte = startDateStr;
            console.log("Filter created_on.$gte set to:", filter.created_on.$gte);
        }
        
        if (body.endDate) {
            const endDateStr = body.endDate + ' 23:59:59';
            filter.created_on.$lte = endDateStr;
            console.log("Filter created_on.$lte set to:", filter.created_on.$lte);
        }
        
        if (Object.keys(filter.created_on).length === 0) {
            delete filter.created_on;
        }
    }

    return filter;
};


exports.getAllCustomers = async (req, res) => {
    try {
        const { start, limit } = req.body;

        if (start === undefined || limit === undefined) {
            return res.status(400).json({
                success: false,
                message: 'You need to provide both start and limit in the request body.'
            });
        }

        const parsedStart = parseInt(start, 10);
        const parsedLimit = parseInt(limit, 10);

        if (isNaN(parsedStart) || parsedStart < 0) {
            return res.status(400).json({
                success: false,
                message: 'Start should be a non-negative integer.'
            });
        }

        if (isNaN(parsedLimit) || parsedLimit < 1) {
            return res.status(400).json({
                success: false,
                message: 'Limit must be a positive integer.'
            });
        }

        const filter = createCustomerFilter(req.body);

        const customers = await Customer.find(filter)
            .skip(parsedStart)
            .limit(parsedLimit);

        const totalCustomers = await Customer.countDocuments(filter);

        const totalPages = Math.ceil(totalCustomers / parsedLimit);

        res.status(200).json({
            success: true,
            day_ta: customers,
            pagination: {
                day_ta:totalCustomers,
                totalPages,
                currentPage: Math.floor(parsedStart / parsedLimit) + 1,
                perPage: parsedLimit,
            }
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ success: false, message: 'Something went wrong on the server.' });
    }
};




exports.deleteCustomer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { _id } = req.body;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid Customer ID (_id)' });
        }

        const deletedCustomer = await Customer.findOneAndUpdate(
            { _id },
            { status: false },
            { new: true }
        );

        if (!deletedCustomer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        return res.status(200).json({ message: 'Customer deleted successfully', day_ta: deletedCustomer });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getCustomerById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { _id } = req.body;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid Customer ID (_id)' });
        }

        const customer = await Customer.findOne({ _id, status: true });

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        return res.status(200).json({ message: 'Customer details fetched successfully', day_ta: customer });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

