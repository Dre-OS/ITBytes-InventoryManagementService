const Inventory = require('../models/inventory.model');

// Admin Controllers
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Inventory.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
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
        const product = await Inventory.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
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