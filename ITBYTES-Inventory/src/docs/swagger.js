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
                    required: ['name', 'quantity', 'price', 'tags'],
                    properties: {
                        image: {
                            type: 'object',
                            properties: {
                                url: {
                                    type: 'string',
                                    format: 'uri',
                                    description: 'URL link to the image'
                                },
                                data: {
                                    type: 'string',
                                    format: 'base64',
                                    description: 'Base64 encoded image data starting with data:image/(png|jpg|jpeg|gif);base64,. Max size: 5MB',
                                    pattern: '^data:image\\/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/]*={0,2}$',
                                    maxLength: 7000000 // Roughly 5MB in base64
                                }
                            }
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
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Item tags/categories',
                            default: ['tag1', 'tag2']
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether the item is active',
                            default: true
                        }
                    }
                },
                InventoryResponse: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'MongoDB document ID (used as item identifier)'
                        },                        image: {
                            type: 'object',
                            properties: {
                                url: {
                                    type: 'string',
                                    format: 'uri',
                                    description: 'URL link to the image'
                                },
                                data: {
                                    type: 'string',
                                    format: 'base64',
                                    description: 'Base64 encoded image of the item'
                                }
                            }
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
                        },
                        tags: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Item tags/categories'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether the item is active'
                        }
                    }
                },
                OrderRequest: {
                    type: 'object',
                    required: ['id', 'quantity'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID of the item to order'
                        },
                        quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Quantity to order'
                        },
                        customerName: {
                            type: 'string',
                            description: 'Name of the customer placing the order'
                        },
                        customerEmail: {
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
                        id: {
                            type: 'string',
                            description: 'ID of the ordered item'
                        },
                        quantity: {
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
        },
        swaggerOptions: {
            defaultModelsExpandDepth: -1  // This will hide the schemas section at the bottom
        }
    },
    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;