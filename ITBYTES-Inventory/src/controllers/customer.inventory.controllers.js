const Inventory = require('../models/inventory.model');

// Customer Controllers
exports.getAvailableProducts = async (req, res) => {
    try {
        // Only return products that are in stock
        const products = await Inventory.find({ quantity: { $gt: 0 } });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductDetails = async (req, res) => {
    try {
        const product = await Inventory.findOne({ 
            productId: req.params.productId,
            quantity: { $gt: 0 } 
        });
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found or out of stock' });
        }

        // Return limited product details for customers
        const productDetails = {
            productId: product.productId,
            productName: product.productName,
            price: product.price,
            category: product.category,
            inStock: product.quantity > 0
        };

        res.status(200).json(productDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkAvailability = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        const product = await Inventory.findOne({ productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const available = product.quantity >= quantity;
        res.status(200).json({
            available,
            productName: product.productName,
            requestedQuantity: quantity,
            message: available ? 'Product is available' : 'Insufficient stock'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Process order and update stock
exports.processOrder = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        const product = await Inventory.findOne({ productId });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        product.quantity -= quantity;
        if (product.quantity < 1) {
            return res.status(400).json({ message: 'Order would deplete stock below minimum threshold' });
        }

        product.lastUpdated = Date.now();
        const updatedProduct = await product.save();
        
        // Simplified response without event publishing
        res.status(200).json({
            message: 'Order processed successfully',
            orderDetails: {
                productId: product.productId,
                productName: product.productName,
                quantity: quantity,
                price: product.price,
                total: quantity * product.price
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};