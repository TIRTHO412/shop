const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static assets (HTML, CSS, JS, images) from current directory
app.use(express.static(path.join(__dirname)));

// Send index.html for the home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the HTTP server
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  Chandra Paints Website is live!`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`=================================================`);
});
