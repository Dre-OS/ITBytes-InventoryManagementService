const mongoose = require('mongoose');
const Inventory = require('../models/inventory.model');

// Helper function to convert image data
const convertImageData = (product) => {
    const productObj = product.toObject();
    if (productObj.image && productObj.image.data) {
        productObj.image = {
            data: `data:${productObj.image.contentType || 'image/jpeg'};base64,${productObj.image.data.toString('base64')}`,
            contentType: productObj.image.contentType || 'image/jpeg'
        };
    }
    return productObj;
};

// Customer Controllers
exports.getAvailableProducts = async (req, res) => {
    try {
        // Only return active products that are in stock
        const products = await Inventory.find({ 
            quantity: { $gt: 0 },
            isActive: true 
        });

        // Convert images for all products
        const productsWithConvertedImages = products.map(convertImageData);
        res.status(200).json(productsWithConvertedImages);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getProductDetails = async (req, res) => {
    try {
        const product = await Inventory.findOne({ 
            _id: req.params.id,
            quantity: { $gt: 0 },
            isActive: true
        });
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found or out of stock' });
        }

        // Convert image data for the product
        const productWithConvertedImage = convertImageData(product);
        res.status(200).json(productWithConvertedImage);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.checkAvailability = async (req, res) => {
    try {
        const { id, quantity: requestedQuantity } = req.body;
        
        const product = await Inventory.findOne({ 
            _id: id,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const available = product.quantity >= requestedQuantity;
        res.status(200).json({
            available,
            currentStock: product.quantity,
            name: product.name,
            requestedQuantity,
            message: available ? 'Product is available' : 'Insufficient stock'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Process order and update stock
exports.processOrder = async (req, res) => {
    try {
        const { id, quantity: orderQuantity, customerName, customerEmail } = req.body;
        
        const product = await Inventory.findOne({ 
            _id: id,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.quantity < orderQuantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Check minimum quantity
        if (product.quantity - orderQuantity < 1) {
            return res.status(400).json({ message: 'Order would deplete stock below minimum threshold' });
        }

        // Update stock
        product.quantity -= orderQuantity;
        const updatedProduct = await product.save();
        
        res.status(200).json({
            message: 'Order processed successfully',
            orderId: new mongoose.Types.ObjectId(), // Generate a unique order ID
            orderDetails: {
                productId: product._id,
                name: product.name,
                quantity: orderQuantity,
                price: product.price,
                totalPrice: orderQuantity * product.price,
                customerName,
                customerEmail,
                orderDate: new Date()
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};