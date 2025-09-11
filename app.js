// @ts-nocheck

const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Import the path module

require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;  // Use Render's port in production

// Middleware
app.use(cors());

// Increase payload size limits
app.use(bodyparser.urlencoded({ extended: true, limit: '10mb' })); // Increase URL-encoded payload limit
app.use(bodyparser.json({ limit: '10mb' })); // Increase JSON payload limit

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.end("Hello, world!");
});

app.get('/hi', (req, res) => {
    res.send("Hello!");
});

// Routes
const web_api = require('./routes/webRoutes/api');
app.use('/web', web_api);

const app_api = require('./routes/appRoutes/api');
app.use('/app', app_api);

// Error handling for large payloads
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ error: 'Payload too large. Please reduce file size.' });
    }
    next(err);
});

// Start the server
app.listen(PORT, () => {
    console.log(`App is running on port: ${PORT}`);
});
