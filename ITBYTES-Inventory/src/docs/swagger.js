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