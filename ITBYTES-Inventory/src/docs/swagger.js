const swaggerJsdoc = require('swagger-jsdoc');

const options = {
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
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            schemas: {
                Inventory: {
                    type: 'object',
                    required: ['ItemId', 'Name', 'Quantity', 'Price', 'Tags'],
                    properties: {
                        ItemId: {
                            type: 'string',
                            description: 'Unique identifier for the item'
                        },
                        Name: {
                            type: 'string',
                            description: 'Name of the item'
                        },
                        Quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Current stock quantity'
                        },
                        Description: {
                            type: 'string',
                            description: 'Item description'
                        },
                        Price: {
                            type: 'number',
                            minimum: 0,
                            description: 'Item price'
                        },
                        Tags: {
                            type: 'string',
                            description: 'Item tags/category'
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
                        ItemId: {
                            type: 'string',
                            description: 'Unique identifier for the item'
                        },
                        Name: {
                            type: 'string',
                            description: 'Name of the item'
                        },
                        Quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Current stock quantity'
                        },
                        Description: {
                            type: 'string',
                            description: 'Item description'
                        },
                        Price: {
                            type: 'number',
                            minimum: 0,
                            description: 'Item price'
                        },
                        Tags: {
                            type: 'string',
                            description: 'Item tags/category'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether the item is active'
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
                    required: ['ItemId', 'Quantity'],
                    properties: {
                        ItemId: {
                            type: 'string',
                            description: 'ID of the item to order'
                        },
                        Quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Quantity to order'
                        },
                        CustomerName: {
                            type: 'string',
                            description: 'Name of the customer placing the order'
                        },
                        CustomerEmail: {
                            type: 'string',
                            format: 'email',
                            description: 'Email of the customer'
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
                        ItemId: {
                            type: 'string',
                            description: 'ID of the ordered item'
                        },
                        Quantity: {
                            type: 'number',
                            description: 'Quantity ordered'
                        },
                        totalPrice: {
                            type: 'number',
                            description: 'Total price of the order'
                        },
                        orderDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Date and time when the order was placed'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'],
                            description: 'Current status of the order'
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
                        currentStock: {
                            type: 'number',
                            description: 'Current available quantity'
                        },
                        message: {
                            type: 'string',
                            description: 'Additional information about availability'
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
    swaggerOptions: {
        defaultModelsExpandDepth: -1  // This will hide the schemas section at the bottom
    }
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;