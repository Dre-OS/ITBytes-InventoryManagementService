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
                            description: 'Unique identifier for the item',
                            example: 'ITEM001'
                        },
                        Name: {
                            type: 'string',
                            description: 'Name of the item',
                            example: 'RGB Gaming Mouse'
                        },
                        Quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Current stock quantity (minimum 1)',
                            example: 50
                        },
                        Description: {
                            type: 'string',
                            description: 'Item description',
                            example: 'High-performance gaming mouse with RGB lighting'
                        },
                        Price: {
                            type: 'number',
                            minimum: 0,
                            description: 'Item price (cannot be negative)',
                            example: 2999.99
                        },
                        Tags: {
                            type: 'string',
                            description: 'Item tags/category',
                            example: 'Gaming Peripherals'
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'Whether the item is active in the inventory',
                            default: true,
                            example: true
                        },
                        lastUpdated: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp',
                            example: '2025-06-22T08:00:00.000Z'
                        }
                    }
                },
                InventoryResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Operation success status'
                        },
                        data: {
                            $ref: '#/components/schemas/Inventory'
                        },
                        message: {
                            type: 'string',
                            description: 'Response message'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                },
                StockUpdate: {
                    type: 'object',
                    required: ['Quantity'],
                    properties: {
                        Quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'New stock quantity',
                            example: 100
                        }
                    }
                },
                OrderRequest: {
                    type: 'object',
                    required: ['ItemId', 'Quantity'],
                    properties: {
                        ItemId: {
                            type: 'string',
                            description: 'Item ID to order',
                            example: 'ITEM001'
                        },
                        Quantity: {
                            type: 'number',
                            minimum: 1,
                            description: 'Quantity to order',
                            example: 2
                        }
                    }
                },
                OrderResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Order status message'
                        },
                        orderDetails: {
                            type: 'object',
                            properties: {
                                ItemId: {
                                    type: 'string',
                                    description: 'Item ID'
                                },
                                Name: {
                                    type: 'string',
                                    description: 'Item name'
                                },
                                Quantity: {
                                    type: 'number',
                                    description: 'Ordered quantity'
                                },
                                Price: {
                                    type: 'number',
                                    description: 'Price per unit'
                                },
                                total: {
                                    type: 'number',
                                    description: 'Total order price'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;