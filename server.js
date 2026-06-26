const express = require('express');
const path = require('path');
const app = express();

// This points to the "dist" folder (where Vite builds your files)
app.use(express.static(path.join(__dirname, 'dist')));

// Redirect all traffic to index.html so React Router works
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});