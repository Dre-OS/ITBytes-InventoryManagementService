const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    ItemId: {
        type: String,
        required: true,
        unique: true
    },
    Name: {
        type: String,
        required: true
    },
    Quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1']
    },
    Description: {
        type: String,
        default: ''
    },
    Price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    Tags: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
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