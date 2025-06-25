const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const mongoose = require('mongoose');

const connectDB = require('./configs/mongodb.config');
const adminInventoryRoutes = require('./routes/admin.inventory.route');
const customerInventoryRoutes = require('./routes/customer.inventory.route');

// Load environment variables
require('dotenv').config();

// Swagger Configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ITBytes Inventory Management API',
            version: '1.0.0',
            description: 'API documentation for ITBytes Inventory Management Service',
            contact: {
                name: 'ITBytes Team'
            }
        },
        servers: [
            {
                url: 'http://192.168.9.2:3000',
                description: 'Inventory'
            }
        ],
        components: {
            schemas: {
                Inventory: {
                    type: 'object',
                    required: ['name', 'quantity', 'price', 'tags'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name of the item',
                            default: ''
                        },
                        quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Current stock quantity',
                            default: 1
                        },
                        description: {
                            type: 'string',
                            description: 'Item description',
                            default: ''
                        },
                        price: {
                            type: 'number',
                            minimum: 0,
                            description: 'Item price',
                            default: 0
                        },                        tags: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Item tags/category',
                            default: ["tag1", "tag2"]
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether the item is active',
                            default: true
                        },
                        lastUpdated: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                InventoryResponse: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'MongoDB document ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the item'
                        },
                        quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Current stock quantity'
                        },
                        description: {
                            type: 'string',
                            description: 'Item description'
                        },
                        price: {
                            type: 'number',
                            minimum: 0,
                            description: 'Item price'
                        },                        tags: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Item tags/category',
                            default: ["tag1", "tag2"]
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether the item is active',
                            default: true
                        },
                        lastUpdated: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                OrderRequest: {
                    type: 'object',
                    required: ['id', 'quantity'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'MongoDB _id of the product'
                        },
                        quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Quantity to order',
                            default: 1
                        },
                        customerName: {
                            type: 'string',
                            description: 'Name of the customer',
                            default: ''
                        },
                        customerEmail: {
                            type: 'string',
                            format: 'email',
                            description: 'Email of the customer',
                            default: ''
                        }
                    }
                },
                OrderResponse: {
                    type: 'object',
                    properties: {
                        orderId: {
                            type: 'string',
                            description: 'Unique order identifier'
                        },
                        message: {
                            type: 'string',
                            description: 'Order status message',
                            default: 'Order processed successfully'
                        },
                        orderDetails: {
                            type: 'object',
                            properties: {
                                productId: {
                                    type: 'string',
                                    description: 'MongoDB _id of the product'
                                },
                                name: {
                                    type: 'string',
                                    description: 'Name of the product'
                                },
                                quantity: {
                                    type: 'number',
                                    description: 'Quantity ordered',
                                    minimum: 1
                                },
                                price: {
                                    type: 'number',
                                    description: 'Price per unit',
                                    minimum: 0
                                },
                                totalPrice: {
                                    type: 'number',
                                    description: 'Total order price',
                                    minimum: 0
                                },
                                customerName: {
                                    type: 'string',
                                    description: 'Name of the customer'
                                },
                                customerEmail: {
                                    type: 'string',
                                    description: 'Email of the customer'
                                },
                                orderDate: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Date and time of the order'
                                }
                            }
                        }
                    }
                },
                AvailabilityResponse: {
                    type: 'object',
                    properties: {
                        available: {
                            type: 'boolean',
                            description: 'Whether the requested quantity is available',
                            default: false
                        },
                        currentStock: {
                            type: 'number',
                            description: 'Current available quantity',
                            minimum: 0,
                            default: 0
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the product'
                        },
                        requestedQuantity: {
                            type: 'number',
                            description: 'Quantity that was requested',
                            minimum: 1
                        },
                        message: {
                            type: 'string',
                            description: 'Availability status message',
                            default: 'Checking availability'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message',
                            default: 'An error occurred'
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
const app = express();

// Middleware with increased payload size limits
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

// Basic route
app.get('/', (req, res) => {
    res.send('ITBytes Inventory Management Service is running');
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css',
    customSiteTitle: "ITBytes Inventory API Documentation",
    swaggerOptions: {
        defaultModelsExpandDepth: -1,
        docExpansion: 'none'
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

// Connect to MongoDB first, then start the server
const startServer = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB successfully');
        
        app.listen(PORT, () => {
            console.log(`Inventory Management Service is running on port ${PORT}`);
            console.log(`Swagger documentation is available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

startServer();