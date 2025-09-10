const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        // Create the directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir); // Save files to the "uploads" folder
    },
    filename: (req, file, cb) => {
        const originalName = path.basename(file.originalname, path.extname(file.originalname)); // Get the name without extension
        const extension = path.extname(file.originalname); // Get the file extension

        // Create a unique filename
        let filename = originalName + extension;
        let count = 1;

        // Check if the file already exists and create a new name if needed
        while (fs.existsSync(path.join('uploads', filename))) {
            filename = `${originalName} (${count})${extension}`; // Add a number to the filename
            count++;
        }

        cb(null, filename); // Use the unique filename
    }
});

// Validate file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/; // Allowed file types
    const isValidType = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);

    // Allow or reject the file
    if (isValidType) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only images (jpeg, jpg, png) are allowed!')); // Reject the file
    }
};

// Configure Multer with limits and filters
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 2MB
    fileFilter
});

// Export the upload configuration
module.exports = upload;
