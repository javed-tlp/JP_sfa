const User = require("../../models/webMod/adminModel"); // Updated import path
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult, matchedData } = require('express-validator');

// Add System User
exports.createSystemAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', errors: errors.mapped() });
    }

    try {
        const { name, mobile_no, email, role, username, password } = req.body;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email or username' });
        }

        // Create session token
        const tokenData = { name, mobile_no, password };
        const session_token = jwt.sign({ tokenData }, process.env.JWT_SECRET, { algorithm: "HS256" });
        console.log("TokenData--->", tokenData);

        const newUser = new User({
            name, mobile_no, email, role, username,
            password, session_token: null, status: true
        });
        console.log("User--->", newUser);

        await newUser.save();

        res.status(201).json({ message: "System User Added", status: "success" });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update System User
exports.updateSystemAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', errors: errors.mapped() });
    }

    // Destructure the incoming request body
    const { user_id, name, mobile_no, email, role, username, password } = req.body;

    try {
        // Find the user by user_id
        const user = await User.findOne({ user_id });
        console.log("User--->>", user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check for existing email or username conflicts
        const existingUser = await User.findOne({
            $or: [{ email, status: true }, { username, status: true }],
            user_id: { $ne: user.user_id } // Exclude the current user by user_id
        });
        console.log("Existing User---->",existingUser)

        if (existingUser) {
            return res.status(400).json({ message: 'Email or username already exists' });
        }

        // Update provided fields based on what is provided in the request
        if (name) user.name = name;
        if (mobile_no) user.mobile_no = mobile_no;
        if (email) user.email = email;
        if (role) user.role = role;
        if (username) user.username = username;

        // Uncomment to hash password if updated
        // if (password) {
        //     const salt = await bcrypt.genSalt(10);
        //     user.password = await bcrypt.hash(password, salt);
        // }

        // Save the updated user to the database
        await user.save();
        console.log("Updated userdata--->", user);

        // Send success response
        res.status(200).json({ message: 'User updated successfully', day_ta:user });
    } catch (err) {
        console.error('Error during user update:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Utility function to create filters for system administrators
const createAdminFilter = (body) => {
    const filter = { status: true }; // Initialize with status filter

    // Add filters based on provided criteria
    if (body.name) {
        filter.name = new RegExp(body.name, 'i'); // Case-insensitive match
    }
    if (body.email) {
        filter.email = new RegExp(`^${body.email}`, 'i'); // Matches email starting with provided value
    }
    if (body.role) {
        filter.role = body.role; // Direct match for role
    }
    if (body.mobile_no) {
        filter.mobile_no = new RegExp(`^${body.mobile_no}`, 'i'); // Matches mobile_no starting with provided value
    }
    if (body.created_by) {
        filter.created_by = new RegExp(body.created_by, 'i'); // Case-insensitive match for created_by
    }
    if (body.startDate || body.endDate) {
        filter.created_on = {}; // Ensure you're checking the correct field
    
        // Log the received startDate and endDate for debugging
        console.log("Received startDate:", body.startDate);
        console.log("Received endDate:", body.endDate);
    
        // Format startDate and endDate as strings for direct comparison
        if (body.startDate) {
            // Format the start date to match your database's string format
            const startDateStr = body.startDate + ' 00:00:00'; // Start of the day
            filter.created_on.$gte = startDateStr; // Set the start filter value
            console.log("Filter created_on.$gte set to:", filter.created_on.$gte); // Log the start filter value
        }
        
        if (body.endDate) {
            // Format the end date to match your database's string format
            const endDateStr = body.endDate + ' 23:59:59'; // End of the day
            filter.created_on.$lte = endDateStr; // Set the end filter value
            console.log("Filter created_on.$lte set to:", filter.created_on.$lte); // Log the end filter value
        }
    }
    
    // Log the final filter object before using it in the query
    console.log("Final filter object:", filter);
    
    

    return filter; // Return the constructed filter
};


exports.getSystemAdmins = async (req, res) => {
    try {
        // Grab start and limit from the request body
        const { start, limit } = req.body;

        // Check if start and limit are provided
        if (start === undefined || limit === undefined) {
            return res.status(400).json({
                message: 'You need to provide both start and limit in the request body.'
            });
        }

        // Convert them to integers
        const parsedStart = parseInt(start, 10);
        const parsedLimit = parseInt(limit, 10);

        // Make sure they're valid numbers
        if (isNaN(parsedStart) || parsedStart < 0) {
            return res.status(400).json({
                message: 'Start should be a non-negative integer.'
            });
        }

        if (isNaN(parsedLimit) || parsedLimit < 1) {
            return res.status(400).json({
                message: 'Limit must be a positive integer.'
            });
        }

        // Create filters based on the request body
        const filter = createAdminFilter(req.body);

        // Fetch the administrators with pagination and filtering
        const users = await User.find(filter)
            .skip(parsedStart)
            .limit(parsedLimit);

        // Count total users for pagination info
        const totalUsers = await User.countDocuments(filter);

        // Calculate total pages
        const totalPages = Math.ceil(totalUsers / parsedLimit);

        // Respond with the user data and pagination info
        res.status(200).json({
            message: "Users retrieved successfully",
            users,
            pagination: {
                day_ta:totalUsers,
                totalPages,
                currentPage: Math.floor(parsedStart / parsedLimit) + 1,
                perPage: parsedLimit,
                fil:filter
            }
        });
    } catch (err) {
        console.error('Error retrieving users:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


// Soft delete a System User
exports.deleteSystemAdmin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', errors: errors.mapped() });
    }

    const { user_id } = req.body;

    try {
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Soft delete by setting status to false
        user.status = false;
        await user.save();
        console.log("Updated user status to false--->", user);

        res.status(200).json({ message: 'User deleted successfully', day_ta:user });
    } catch (err) {
        console.error('Error during user deletion:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Login System User
exports.login = async (req, res) => {
    console.log("Login attempt with body:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.mapped());
        return res.status(400).json({ message: 'Invalid Values', errors: errors.mapped() });
    }

    try {
        const { email, password } = req.body;
        console.log("Received email:", email);

        const user = await User.findOne({ email, status: true });
        if (!user) {
            console.log("No user found with email:", email);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Password comparison
        if (user.password !== password) {
            console.log("Password mismatch for user:", email);
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Create session token
        const tokenData = { name: user.name, email: user.email };
        const session_token = jwt.sign({ tokenData }, process.env.JWT_SECRET, { algorithm: "HS256" ,expiresIn: '1h' });
        console.log("SessionToken generated:", session_token);
        console.log("TokenData for session:", tokenData);

        // Update session token in DB
        user.session_token = session_token;
        await user.save();
        console.log("Updated user with session token:", user);

        res.status(200).json({ message: "Login successful", token: session_token });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Logout System User
exports.logout = async (req, res) => {
    const { token } = req.body; // Token from request body

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decoded.tokenData;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clear session token
        user.session_token = null;
        await user.save();

        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Controller to handle Admin Profile fetching by _id
exports.getAdminProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', errors: errors.mapped() });
    }

    const { _id } = req.body;

    try {
        // Fetch the admin profile by _id
        const admin = await User.findOne({ _id, status: true });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin profile fetched successfully', day_ta:admin });
    } catch (err) {
        console.error('Error fetching admin profile:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
