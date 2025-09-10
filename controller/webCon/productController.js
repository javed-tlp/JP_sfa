// controllers/webCon/productAndSubcategoryController.js
const { validationResult } = require('express-validator');
const Product = require('../../models/webMod/productModel'); // Import the Product model
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility
const mongoose = require('mongoose');


// Product Category Controllers

// Add a new product category
exports.addProductCategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', status: 'invalid', errors: errors.array() });
    }

    try {
        const { name, code, description, image_path, status } = req.body;

        const productData = new Product.Category({
            name,
            code,
            description,
            image_path,
            status,
        });

        const savedProduct = await productData.save();

        res.status(201).json({
            message: "Product Category Added Successfully",
            status: "success",
            day_ta: savedProduct,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};


// Get all product categories
exports.getAllProductCategories = async (req, res) => {
    try {
        const products = await Product.Category.find({ status: true }); // Only return active products
        const productCount = await Product.Category.countDocuments({ status: true });

        res.status(200).json({
            message: "Product Categories Retrieved Successfully",
            status: "success",
            day_ta: products,
            count: productCount
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};

exports.updateProductCategory = async (req, res) => {
    const { _id } = req.body; // Use _id to search for the category
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', status: 'invalid', errors: errors.array() });
    }

    try {
        // Find the category by _id and update it
        const updatedProduct = await Product.Category.findByIdAndUpdate(
            _id,  // Use _id for search
            { 
                name: req.body.name,
                code: req.body.code,
                description: req.body.description,
                image_path: req.body.image_path,
                status: req.body.status,
                updated_on: getCurrentDateTime() // Update timestamp
            },
            { new: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product Category Not Found", status: "failed" });
        }

        res.status(200).json({
            message: "Product Category Updated Successfully",
            status: "success",
            day_ta: updatedProduct,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};


exports.deleteProductCategory = async (req, res) => {
    const { _id } = req.body; // Use _id to search for the category

    try {
        // Find the category by _id and set its status to false
        const deletedProduct = await Product.Category.findByIdAndUpdate(
            _id,  // Use _id for search
            { status: false },  // Set status to false instead of deleting
            { new: true }  // Return the updated document
        );

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product Category Not Found", status: "failed" });
        }

        res.status(200).json({
            message: "Product Category Deleted Successfully",
            status: "success",
            day_ta: deletedProduct,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};


// Subcategory Controllers

exports.addSubcategory = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', status: 'invalid', errors: errors.array() });
    }

    try {
        // Fetch the category by its _id
        const category = await Product.Category.findById(req.body._id); // Assuming _id is passed for category reference

        if (!category) {
            return res.status(404).json({ message: "Category Not Found", status: "failed" });
        }

        // Create a new subcategory using _id for category reference and category name
        const subcategoryData = new Product.Subcategory({
            category_id: req.body._id,  // Use _id instead of category_id
            category_name: category.name, // Save the category name in subcategory
            name: req.body.name,
            description: req.body.description,
            status: req.body.status,
        });

        const savedSubcategory = await subcategoryData.save();

        res.status(201).json({
            message: "Subcategory Added Successfully",
            status: "success",
            day_ta: savedSubcategory,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};



// Update Subcategory by _id
exports.updateSubcategory = async (req, res) => {
    const { _id } = req.body;  // Use _id instead of subcategory_id
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', status: 'invalid', errors: errors.array() });
    }

    try {
        // Find and update the subcategory by _id
        const updatedSubcategory = await Product.Subcategory.findByIdAndUpdate(
            _id, // Search by _id
            { 
                name: req.body.name,
                description: req.body.description,
                status: req.body.status,
                updated_on: getCurrentDateTime() // Update timestamp
            },
            { new: true } // Return the updated document
        );

        if (!updatedSubcategory) {
            return res.status(404).json({ message: "Subcategory Not Found", status: "failed" });
        }

        res.status(200).json({
            message: "Subcategory Updated Successfully",
            status: "success",
            day_ta: updatedSubcategory,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};

// Delete Subcategory by _id (Soft delete)
exports.deleteSubcategory = async (req, res) => {
    const { _id } = req.body;  // Use _id instead of subcategory_id
    console.log("SubCategory---->", _id);

    try {
        // Find and "soft delete" the subcategory by _id
        const deletedSubcategory = await Product.Subcategory.findByIdAndUpdate(
            _id, // Search by _id
            { status: false }, // Soft delete by setting status to false
            { new: true } // Return the updated document
        );
        console.log("Deleted subcategory", deletedSubcategory);

        if (!deletedSubcategory) {
            return res.status(404).json({ message: "Subcategory Not Found", status: "failed" });
        }

        res.status(200).json({
            message: "Subcategory Deleted Successfully",
            status: "success",
            day_ta: deletedSubcategory,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};


exports.getAllSubcategories = async (req, res) => {
    try {
        const { category_id } = req.body; // Extract category_id from the body

        // Create filter object to fetch only active subcategories
        const filter = { status: true };

        // If category_id is provided in the body, filter subcategories by category_id
        if (category_id) {
            filter.category_id = category_id; // Filter by category_id (assuming it's the _id of the category)
        }

        // Fetch subcategories based on filter
        const subcategories = await Product.Subcategory.find(filter);

        // Count the filtered subcategories
        const subcategoriesCount = await Product.Subcategory.countDocuments(filter);

        // Send response
        res.status(200).json({
            message: "Subcategories Retrieved Successfully",
            status: "success",
            day_ta: subcategories,
            count: subcategoriesCount
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};
    



exports.addProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', status: 'invalid', errors: errors.array() });
    }

    try {
        // Find the subcategory using the provided _id (subcategory_id)
        const subcategory = await Product.Subcategory.findById(req.body.subcategory_id); 
        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory Not Found", status: "error" });
        }

        // Find the category using the _id from subcategory's category_id
        const category = await Product.Category.findById(subcategory.category_id); 
        if (!category) {
            return res.status(404).json({ message: "Category Not Found", status: "error" });
        }

        // If an image is uploaded, set the path
        const imagePath = req.file ? 'uploads/' + req.file.filename : null;

        // Create the product day_ta entry, using the _id fields for subcategory and category
        const productDataEntries = new Product.ProductData({
            subcategory_id: subcategory._id,           // MongoDB _id for subcategory
            subcategory_name: subcategory.name,
            category_id: category._id,                 // MongoDB _id for category
            category_name: category.name,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            image_path: imagePath,                     // Store image path if available
            status: req.body.status,
        });

        // Save the product
        const savedProduct = await productDataEntries.save();

        res.status(201).json({
            message: "Product Added Successfully",
            status: "success",
            day_ta: savedProduct,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};




// Update product with image based on _id
exports.updateProduct = async (req, res) => {
    const { _id } = req.body;  // Use _id instead of product_id
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Invalid Values', status: 'invalid', errors: errors.array() });
    }

    try {
        const updatedData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            status: req.body.status,
            updated_on: getCurrentDateTime(),
        };

        if (req.file) {
            updatedData.image_path = 'uploads/' + req.file.filename; // Update image path if a new file is uploaded
        }

        const updatedProduct = await Product.ProductData.findOneAndUpdate(
            { _id },  // Find product by _id
            updatedData,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product Not Found", status: "failed" });
        }

        res.status(200).json({
            message: "Product Updated Successfully",
            status: "success",
            day_ta: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};



// Delete a product by _id
exports.deleteProduct = async (req, res) => {
    const { _id } = req.body;  // Use _id instead of product_id

    try {
        const deletedProduct = await Product.findOneAndUpdate(
            { _id },  // Find product by _id
            { status: false }, // Set status to false instead of deleting
            { new: true } // Return the updated document
        );

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product Not Found", status: "failed" });
        }

        res.status(200).json({
            message: "Product Deleted Successfully",
            status: "success",
            day_ta: deletedProduct,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};


exports.getProductsBySubcategory = async (req, res) => {
    const { category_id, subcategory_id, name, price_min, price_max, status, startDate, 
        endDate } = req.body; // Destructure filters from the request body

    // Prepare filter conditions
    const filterConditions = { status: true }; // Default to active products

    // Add category filter if provided
    if (category_id) {
        filterConditions.category_id = category_id;
    }

    // Add subcategory filter if provided
    if (subcategory_id) {
        filterConditions.subcategory_id = subcategory_id;
    }

    // Add name filter if provided (case-insensitive search)
    if (name) {
        filterConditions.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }

    // Add price range filter if provided
    if (price_min) {
        filterConditions.price = { ...filterConditions.price, $gte: price_min };
    }
    if (price_max) {
        filterConditions.price = { ...filterConditions.price, $lte: price_max };
    }

    // Add status filter if provided
    if (status !== undefined) {
        filterConditions.status = status;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
        // Convert startDate and endDate to the same format as created_on field (string format)
        const formattedStartDate = moment(startDate, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
        const formattedEndDate = moment(endDate, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");

        filterConditions.created_on = {
            $gte: formattedStartDate,  // Start date
            $lte: formattedEndDate     // End date
        };
    }

    try {
        const products = await Product.ProductData.find(filterConditions); // Fetch products based on filters
        const productCount = await Product.ProductData.countDocuments(filterConditions); // Count the number of filtered products

        res.status(200).json({
            message: "Products Retrieved Successfully",
            status: "success",
            day_ta: products,
            count: productCount
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};



exports.getProductIdAndName = async (req, res) => {
    try {
        // Fetch products with only _id and name, filtering by active status
        const products = await Product.ProductData.find(
            { status: true },
            { _id: 1, name: 1 } // Project only _id and name fields
        );

        console.log("Product List (_id and name):", products);

        res.status(200).json({
            message: "Product List Retrieved Successfully",
            status: "success",
            day_ta:products,
            count: products.length,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Error Occurred",
            status: "error",
            error: error.message,
        });
    }
};


exports.getProductById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { _id } = req.body; // Get _id from the request body

        // Check if _id is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid Product ID (_id)' });
        }

        // Find the product by _id and ensure its status is true
        const product = await Product.ProductData.findOne({ _id, status: true });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Return the found product details
        return res.status(200).json({ message: 'Product details fetched successfully', day_ta: product });
    } catch (error) {
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};