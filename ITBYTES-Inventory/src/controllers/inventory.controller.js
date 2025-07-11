const Inventory = require('../models/inventory.model');
const InventoryIn = require('../models/inventory.in.model')
const { publisher, MessagingController } = require('../configs/rabbitmq.config');

// //test RabbitMQ connection
// exports.testRabbitMQSend = async (req, res) => {
//     try {
//         // Check RabbitMQ connection status
//         publisher.inventoryUpdated(server.channel, Buffer.from('Test message'));
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: 'Failed to test RabbitMQ connection'
//         });
//     }
// }; 

// Validate MongoDB ID
const isValidObjectId = (id) => {
    return id && id.match(/^[0-9a-fA-F]{24}$/);
};

const inventoryController = {
    testRabbitMQSend: async (req, res) => {
        try {
            // Check RabbitMQ connection status
            publisher.inventoryUpdated(server.channel, Buffer.from('Test message'));
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to test RabbitMQ connection'
            });
        }
    },
    // Test RabbitMQ connection
    // testRabbitMQConnection: async (req, res) => {
    //     try {
    //         const status = getConnectionStatus();
    //         return res.status(200).json({
    //             success: true,
    //             status: {
    //                 isConnected: status.isConnected,
    //                 isConnecting: status.isConnecting,
    //                 reconnectAttempts: status.reconnectAttempts,
    //                 queues: Object.values(QUEUES)

    //             }
    //         });
    //     } catch (error) {
    //         console.error('RabbitMQ test failed:', error);
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Failed to test RabbitMQ connection'
    //         });
    //     }
    // },
    addStockWhenNameExist: async (req, res) => {
        try {
            const { productId, name, quantity, category,description, price, tags } = req.body;
            const exiting = await Inventory.findOne({ productId, isActive: true });
            if (!exiting) {
               await Inventory.create({
                    productId: productId,
                    name: name,
                    quantity: quantity,
                    category: category,
                    description: description,
                    price: price,
                    tags: tags,   
                    lastUpdated: new Date()
                });
            }
            else {
                // Update stock quantity
                exiting.quantity += quantity;
                const updatedProduct = await exiting.save();
                // Publish to RabbitMQ
                // publisher.inventoryUpdated(server.channel, Buffer.from(JSON.stringify(updatedProduct)));
                res.json({
                    message: 'Stock updated successfully',
                    product: updatedProduct
                });
            }
            const result = await InventoryIn.findOneAndUpdate(
                { productId: productId, isDeleted: false },
                { isDeleted: true })
            if (!result) {
                console.error('No product input request found to delete');
            } else console.log('Stock added successfully:', result);
            res.status(201).json({
                message: 'Stock added successfully',
                product: {
                    productId: productId,
                    name: name,
                    quantity: quantity,
                    category: category,
                    description: description,
                    price: price,
                    tags: tags
                }
            });
        } catch (error) {
            console.error('Error adding stock:', error);
            res.status(500).json({
                message: 'Error adding stock',
                code: 'ADD_STOCK_ERROR'
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
    // Update an existing product
    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;

            // Validate ID
            if (!id || !isValidObjectId(id)) {
                return res.status(400).json({
                    message: 'Invalid product ID',
                    code: 'INVALID_ID'
                });
            }

            // Get the current product to check if it exists and is active
            const currentProduct = await Inventory.findById(id);
            if (!currentProduct) {
                return res.status(404).json({
                    message: 'Product not found',
                    code: 'NOT_FOUND'
                });
            }

            if (!currentProduct.isActive) {
                return res.status(400).json({
                    message: 'Cannot update inactive product',
                    code: 'INACTIVE_PRODUCT'
                });
            }

            // Prepare update data with allowed fields
            const updateData = {
                name: req.body.name,
                quantity: req.body.quantity,
                description: req.body.description,
                price: req.body.price,
                image: req.body.image,
                category: req.body.category,
                tags: req.body.tags,
                lastUpdated: new Date()
            };

            // Remove undefined fields
            Object.keys(updateData).forEach(key => 
                updateData[key] === undefined && delete updateData[key]
            );

            // Update the product
            const updatedProduct = await Inventory.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            // Notify via RabbitMQ if quantity changed
            if (req.body.quantity !== undefined && 
                req.body.quantity !== currentProduct.quantity) {
                try {
                    await publisher.inventoryUpdated(Buffer.from(JSON.stringify({
                        id: updatedProduct._id,
                        name: updatedProduct.name,
                        oldQuantity: currentProduct.quantity,
                        newQuantity: updatedProduct.quantity,
                        change: updatedProduct.quantity - currentProduct.quantity
                    })));
                } catch (mqError) {
                    console.warn('Failed to publish inventory update:', mqError.message);
                }
            }

            res.json(updatedProduct);
        } catch (error) {
            // Handle validation errors
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: error.message,
                    code: 'VALIDATION_ERROR'
                });
            }

            // Handle other errors
            console.error('Update product error:', error);
            res.status(500).json({
                message: 'Error updating product',
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
    },
    // Create a new product input request
    createProductIn: async (req, res) => {
        try {
            // Validate required fields
            const { name, quantity } = req.body;
            if (!name || !quantity) {
                return res.status(400).json({
                    message: 'Name and quantity are required',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Create new product
            const product = new InventoryIn({
                productId: req.body.productId || null, // Optional field
                name,
                quantity,
                isApproved: false,
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

    // Update a product input request
    updateProductIn: async (req, res) => {
        try {
            // Validate ID
            if (!isValidObjectId(req.params.id)) {
                return res.status(400).json({
                    message: 'Invalid product ID',
                    code: 'INVALID_ID'
                });
            }

            // Only allow updating specific fields
            const { name, quantity, isApproved } = req.body;
            const updateData = {
                ...(productId && { productId }),
                ...(name && { name }),
                ...(quantity && { quantity }),
                ...(isApproved !== undefined && { isApproved }),
                lastUpdated: new Date()
            };

            const updatedProduct = await InventoryIn.findByIdAndUpdate(
                req.params.id,
                updateData,
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
    getProductsIn: async (req, res) => {
        try {
            const productsIn = await InventoryIn.find({isDeleted: false});
            res.json(productsIn);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error fetching product input requests',
                code: 'FETCH_ERROR'
            });
        }
    },
    confirmExistingProduct: async (req, res) => {
        try {
            const {productId}  = req.body;
            console.log('Checking product existence for ID:', productId);
            
            // Validate that productId is provided
            if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid productId format',
                code: 'INVALID_ID'
            });
            }
            
            // Check if product exists in inventory
            const product = await Inventory.findOne({productId: productId});
            
            return res.status(200).json({
            success: true,
            exists: !!product,
            product: product ? {
                id: product._id,
                name: product.name
            } : null
            });
        } catch (error) {
            console.error('Error checking product existence:', error);
            res.status(500).json({
            success: false,
            message: 'Error checking if product exists',
            code: 'CHECK_PRODUCT_ERROR'
            });
        }
    },

    // Soft delete a product
    deleteProductIn: async (req, res) => {
        try {
            const { productId } = req.params;

            // Validate ID
            if (!id || !isValidObjectId(id)) {
                return res.status(400).json({
                    message: 'Invalid product ID',
                    code: 'INVALID_ID'
                });
            }

            const product = await InventoryIn.findById(productId);

            // Check if product exists
            if (!product) {
                return res.status(404).json({ 
                    message: 'Product not found',
                    code: 'NOT_FOUND'
                });
            }

            // Check if product is already inactive
            if (!product.isDeleted) {
                return res.status(400).json({
                    message: 'Product is already deactivated',
                    code: 'ALREADY_INACTIVE'
                });
            }

            // Perform soft delete
            product.isDeleted = false;
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
    }
};

module.exports = inventoryController;