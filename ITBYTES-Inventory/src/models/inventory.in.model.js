const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative']
    },
    price: {
        type: Number,
        required: false,
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: false,
        trim: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }
},
{timestamps: true});

const InventoryIn = mongoose.model('InventoryIn', inventorySchema);
module.exports = InventoryIn;