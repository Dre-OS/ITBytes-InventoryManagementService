const Inventory = require('../models/inventory.model');

// Admin Controllers
exports.getAllProducts = async (req, res) => {
    try {
        // Get query parameter for including inactive products
        const includeInactive = req.query.includeInactive === 'true';
        
        // Build query based on whether to include inactive products
        const query = includeInactive ? {} : { isActive: true };
        
        const products = await Inventory.find(query);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        // Include inactive products in single product lookup
        const product = await Inventory.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const product = new Inventory(req.body);
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Inventory.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Allow admin to update all product fields
        Object.keys(req.body).forEach(key => {
            product[key] = req.body[key];
        });

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Inventory.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Implement soft delete by setting isActive to false
        product.isActive = false;
        await product.save();

        res.status(200).json({ 
            message: 'Product successfully deactivated',
            productId: product._id,
            productName: product.name,
            deactivatedAt: new Date(),
            note: 'Product has been marked as inactive and will not appear in customer listings'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add restore function to reactivate soft-deleted products
exports.restoreProduct = async (req, res) => {
    try {
        const product = await Inventory.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Restore the product by setting isActive to true
        product.isActive = true;
        await product.save();

        res.status(200).json({ 
            message: 'Product successfully restored',
            productId: product._id,
            productName: product.name,
            restoredAt: new Date(),
            note: 'Product has been reactivated and will now appear in customer listings'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity cannot be less than 1' });
        }

        const product = await Inventory.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.Quantity = quantity;
        const updatedProduct = await product.save();
        
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get inventory statistics
exports.getInventoryStats = async (req, res) => {
    try {
        const stats = await Inventory.aggregate([
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalItems: { $sum: "$quantity" },
                    averagePrice: { $avg: "$price" },
                    lowStock: {
                        $sum: {
                            $cond: [{ $lt: ["$quantity", 10] }, 1, 0]
                        }
                    }
                }
            }
        ]);
        res.status(200).json(stats[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};