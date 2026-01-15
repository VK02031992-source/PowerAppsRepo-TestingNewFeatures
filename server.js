/**
 * Express server to serve the PowerApps web application
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

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
