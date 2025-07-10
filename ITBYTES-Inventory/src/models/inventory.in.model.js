const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
    },
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
    isApproved: {
        type: Boolean,
        default: false
    }
},
{timestamps: true});

const InventoryIn = mongoose.model('InventoryIn', inventorySchema);
module.exports = InventoryIn;