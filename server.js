/**
 * Express server to serve the PowerApps web application
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Enable CORS
app.use(cors());

// Apply rate limiting to all routes
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`PowerApps application is running on http://localhost:${PORT}`);
    console.log(`Open your browser and navigate to http://localhost:${PORT} to view the app`);
});
