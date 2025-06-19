const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./configs/mongodb.config');
const adminInventoryRoutes = require('./routes/admin.inventory.route');
const customerInventoryRoutes = require('./routes/customer.inventory.route');

// Load environment variables
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/admin/inventory', adminInventoryRoutes);
app.use('/api/customer/inventory', customerInventoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});