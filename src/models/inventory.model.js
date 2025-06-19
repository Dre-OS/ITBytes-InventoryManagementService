const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to prevent negative quantities
inventorySchema.pre('save', function(next) {
    if (this.quantity < 1) {
        next(new Error('Quantity cannot be less than 1'));
    }
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema);