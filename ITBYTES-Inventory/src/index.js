const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const connectDB = require('./configs/mongodb.config');
// Temporarily commenting out RabbitMQ and event-related imports
/*
const { connectQueue, consumeMessage, QUEUES } = require('./configs/rabbitmq.config');
const {
    handleOrderCreated,
    handleOrderCancelled,
    handlePaymentConfirmed,
    handlePaymentFailed
} = require('./events/inventory.events');
*/
const adminInventoryRoutes = require('./routes/admin.inventory.route');
const customerInventoryRoutes = require('./routes/customer.inventory.route');

// Load environment variables
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Temporarily commenting out RabbitMQ setup
/*
async function setupEventListeners() {
    try {
        await connectQueue();
        
        // Set up event listeners
        await consumeMessage(QUEUES.ORDER_CREATED, handleOrderCreated);
        await consumeMessage(QUEUES.ORDER_CANCELLED, handleOrderCancelled);
        await consumeMessage(QUEUES.PAYMENT_CONFIRMED, handlePaymentConfirmed);
        await consumeMessage(QUEUES.PAYMENT_FAILED, handlePaymentFailed);
        
        console.log('Event listeners set up successfully');
    } catch (error) {
        console.error('Failed to set up event listeners:', error);
        process.exit(1);
    }
}

setupEventListeners();
*/

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger UI with custom options
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
        defaultModelsExpandDepth: -1,  // Hide schemas section
        docExpansion: 'list'           // Collapse all endpoints by default
    }
}));

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
    console.log(`Inventory Management Service is running on port ${PORT}`);
    console.log(`Swagger documentation is available at http://localhost:${PORT}/api-docs`);
});