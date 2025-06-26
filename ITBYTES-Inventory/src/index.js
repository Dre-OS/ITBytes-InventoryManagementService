const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const mongoose = require('mongoose');

const connectDB = require('./configs/mongodb.config');
const inventoryRoutes = require('./routes/inventory.route');

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
                Product: {
                    type: 'object',
                    required: ['name', 'quantity', 'price', 'category', 'tags'],
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name of the product',
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
                            description: 'Product description',
                            default: ''
                        },
                        price: {
                            type: 'number',
                            minimum: 0,
                            description: 'Product price',
                            default: 0
                        },
                        image: {
                            type: 'string',
                            description: 'Base64 encoded product image',
                            default: ''
                        },
                        category: {
                            type: 'string',
                            description: 'Product category',
                            example: 'Electronics'
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Product tags for additional categorization',
                            default: []
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether the product is active',
                            default: true
                        },
                        lastUpdated: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                ProductResponse: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'MongoDB document ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the product'
                        },
                        quantity: {
                            type: 'number',
                            description: 'Current stock quantity'
                        },
                        description: {
                            type: 'string',
                            description: 'Product description'
                        },
                        price: {
                            type: 'number',
                            description: 'Product price'
                        },
                        image: {
                            type: 'string',
                            description: 'Base64 encoded product image'
                        },
                        category: {
                            type: 'string',
                            description: 'Product category'
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Product tags for additional categorization'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether the product is active'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                OrderRequest: {
                    type: 'object',
                    required: ['productId', 'quantity'],
                    properties: {
                        productId: {
                            type: 'string',
                            description: 'MongoDB _id of the product'
                        },
                        quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Quantity to order',
                            default: 1
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
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed'],
                            description: 'Order status'
                        },
                        message: {
                            type: 'string',
                            description: 'Order status message'
                        },
                        product: {
                            $ref: '#/components/schemas/ProductResponse'
                        },
                        quantity: {
                            type: 'number',
                            description: 'Quantity ordered'
                        },
                        totalPrice: {
                            type: 'number',
                            description: 'Total order price'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Order creation timestamp'
                        }
                    }
                },
                AvailabilityResponse: {
                    type: 'object',
                    properties: {
                        available: {
                            type: 'boolean',
                            description: 'Whether the requested quantity is available'
                        },
                        product: {
                            $ref: '#/components/schemas/ProductResponse'
                        },
                        requestedQuantity: {
                            type: 'number',
                            description: 'Quantity that was requested'
                        },
                        message: {
                            type: 'string',
                            description: 'Availability status message'
                        }
                    }
                },
                Statistics: {
                    type: 'object',
                    properties: {
                        totalProducts: {
                            type: 'number',
                            description: 'Total number of products'
                        },
                        activeProducts: {
                            type: 'number',
                            description: 'Number of active products'
                        },
                        lowStockProducts: {
                            type: 'number',
                            description: 'Number of products with low stock'
                        },
                        totalValue: {
                            type: 'number',
                            description: 'Total value of inventory'
                        },
                        topTags: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    tag: {
                                        type: 'string',
                                        description: 'Tag name'
                                    },
                                    count: {
                                        type: 'number',
                                        description: 'Number of products with this tag'
                                    }
                                }
                            },
                            description: 'Most used product tags'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        code: {
                            type: 'string',
                            description: 'Error code'
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
app.use('/api/inventory', inventoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        message: err.message || 'Something went wrong!',
        code: err.code || 'INTERNAL_SERVER_ERROR'
    });
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