const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'my-app/build')));

app.post('/upload', (req, res) => {
    // Handle file upload logic here
    res.status(200).json({ message: 'File uploaded successfully!' });
});

// Serve React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/my-app/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
