const Inventory = require('../models/inventory.model');
const { getConnectionStatus, QUEUES } = require('../configs/rabbitmq.config');


// Validate MongoDB ID
const isValidObjectId = (id) => {
    return id && id.match(/^[0-9a-fA-F]{24}$/);
};

const inventoryController = {
    // Test RabbitMQ connection
    testRabbitMQConnection: async (req, res) => {
        try {
            const status = getConnectionStatus();
            return res.status(200).json({
                success: true,
                status: {
                    isConnected: status.isConnected,
                    isConnecting: status.isConnecting,
                    reconnectAttempts: status.reconnectAttempts,
                    queues: Object.values(QUEUES)

                }
            });
        } catch (error) {
            console.error('RabbitMQ test failed:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to test RabbitMQ connection'
            });
        }
    },

    // Get all products with optional filtering
    getAllProducts: async (req, res) => {
        try {
            // const { active, inStock } = req.query;
            // let query = {};

            // if (active !== undefined) {
            //     query.isActive = active === 'true';
            // }
            // if (inStock === 'true') {
            //     query.quantity = { $gt: 0 };
            // }

            const products = await Inventory.find({isActive: true});
            res.json(products);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching products', 
                code: 'FETCH_ERROR' 
            });
        }
    },

    // Get a single product by ID
    getProduct: async (req, res) => {
        try {
            const product = await Inventory.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ 
                    message: 'Product not found',
                    code: 'NOT_FOUND'
                });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching product',
                code: 'FETCH_ERROR'
            });
        }
    },

    // Create a new product
    createProduct: async (req, res) => {
        try {
            const product = new Inventory({
                ...req.body,
                lastUpdated: new Date()
            });
            const savedProduct = await product.save();




            res.status(201).json(savedProduct);
        } catch (error) {
            res.status(400).json({ 
                message: error.message,
                code: 'VALIDATION_ERROR'
            });
        }
    },

    // Update a product
    updateProduct: async (req, res) => {
        try {
            const updatedProduct = await Inventory.findByIdAndUpdate(
                req.params.id,
                {
                    ...req.body,
                    lastUpdated: new Date()
                },
                { new: true }
            );
            if (!updatedProduct) {
                return res.status(404).json({ 
                    message: 'Product not found',
                    code: 'NOT_FOUND'
                });
            }

            res.json(updatedProduct);
        } catch (error) {
            res.status(400).json({ 
                message: error.message,
                code: 'UPDATE_ERROR'
            });
        }
    },

    // Soft delete a product
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;

            // Validate ID
            if (!id || !isValidObjectId(id)) {
                return res.status(400).json({
                    message: 'Invalid product ID',
                    code: 'INVALID_ID'
                });
            }

            const product = await Inventory.findById(id);

            // Check if product exists
            if (!product) {
                return res.status(404).json({ 
                    message: 'Product not found',
                    code: 'NOT_FOUND'
                });
            }

            // Check if product is already inactive
            if (!product.isActive) {
                return res.status(400).json({
                    message: 'Product is already deactivated',
                    code: 'ALREADY_INACTIVE'
                });
            }

            // Perform soft delete
            product.isActive = false;
            await product.save();

            res.json({ 
                message: 'Product deactivated successfully',
                product 
            });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ 
                message: 'Error deactivating product',
                code: 'DELETE_ERROR'
            });
        }
    },

    // Check product availability
    checkAvailability: async (req, res) => {
        try {
            const { id, quantity } = req.body;
            const product = await Inventory.findById(id);

            if (!product) {
                return res.status(404).json({ 
                    message: 'Product not found',
                    code: 'NOT_FOUND'
                });
            }

            const available = product.isAvailable(quantity);
            res.json({
                available,
                product,
                requestedQuantity: quantity,
                message: available ? 
                    'Product is available' : 
                    'Requested quantity not available'
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error checking availability',
                code: 'AVAILABILITY_CHECK_ERROR'
            });
        }
    },

    // Process an order
    processOrder: async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const product = await Inventory.findById(productId);

            if (!product) {
                return res.status(404).json({ 
                    message: 'Product not found',
                    code: 'NOT_FOUND'
                });
            }

            if (!product.isAvailable(quantity)) {
                return res.status(400).json({
                    message: 'Insufficient stock',
                    code: 'INSUFFICIENT_STOCK'
                });
            }

            await product.updateStock(-quantity);




            res.json({
                orderId: new Date().getTime().toString(),
                status: 'completed',
                message: 'Order processed successfully',
                product,
                quantity,
                totalPrice: product.price * quantity,
                createdAt: new Date()
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error processing order',
                code: 'ORDER_ERROR'
            });
        }
    },

    // Get inventory statistics
    getInventoryStats: async (req, res) => {
        try {
            const products = await Inventory.find();
            const lowStockProducts = await Inventory.findLowStock();

            // Calculate statistics
            const totalProducts = products.length;
            const activeProducts = products.filter(p => p.isActive).length;

            // Calculate total value and collect tags
            let totalValue = 0;
            const tagCounts = {};

            products.forEach(product => {
                totalValue += product.price * product.quantity;
                product.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            });

            // Sort tags by count and take top 10
            const topTags = Object.entries(tagCounts)
                .map(([tag, count]) => ({ tag, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            res.json({
                totalProducts,
                activeProducts,
                lowStockProducts: lowStockProducts.length,
                totalValue,
                topTags
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching statistics',
                code: 'STATS_ERROR'
            });
        }
    }
};

module.exports = inventoryController;