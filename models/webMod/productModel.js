const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { getCurrentDateTime } = require('../../middlewares/dateTimeUtil'); // Import the utility

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String },
    status: { type: Boolean, default: true },
    created_on: { type: String, default: getCurrentDateTime }, // Store as String
    updated_on: { type: String, default: getCurrentDateTime }, // Store as String
});


// Specify the custom collection name for categories
const Category = mongoose.model("Category", categorySchema, "jps_product_category");

const subcategorySchema = new mongoose.Schema({
    category_id: { type: String, required: true }, // Reference to the category
    category_name: { type: String, required: true }, // Store category name
    name: { type: String, required: true },
    description: { type: String },
    status: { type: Boolean, default: true },
    created_on: { type: String, default: getCurrentDateTime }, // Store as String
    updated_on: { type: String, default: getCurrentDateTime }, // Store as String
});

// Specify the custom collection name for subcategories
const Subcategory = mongoose.model("Subcategory", subcategorySchema, "jps_product_subcategory");


// Define the product schema
const productSchema = new mongoose.Schema({
    category_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' }, // Reference to the category
    category_name: { type: String, required: true }, // Name of the category
    subcategory_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Subcategory' }, // Reference to the subcategory
    subcategory_name: { type: String, required: true }, // Name of the subcategory
    name: { type: String, required: true }, // Product name
    code: { type: String }, // Unique product code
    description: { type: String }, // Product description
    price: { type: Number, required: true }, // Product price
    image_path: { type: String }, // Path to product image
    status: { type: Boolean, default: true }, // Active status of the product
    created_on: { type: String, default: getCurrentDateTime }, // Store as String
    updated_on: { type: String, default: getCurrentDateTime }, // Store as String
});

// Specify the custom collection name for products
const ProductData = mongoose.model("ProductData", productSchema, "jps_product");

// Export the models
module.exports = {
    ProductData,
    Category,    // Ensure Category and Subcategory models are also exported
    Subcategory,
};
