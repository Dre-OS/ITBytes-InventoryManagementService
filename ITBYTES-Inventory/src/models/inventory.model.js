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
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: false,
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        validate: {
            validator: function(v) {
                // Allow empty strings or valid base64 data URLs
                return !v || v.startsWith('data:image/');
            },
            message: 'Image must be a valid base64 data URL'
        }
    },
    category: {
        type: String,
        required: false,
        trim: true
    },
    tags: {
        type: [String],
        required: true,
        default: []
    },
    status: {
        type: String,
        enum: ['pending', 'available', 'out_of_stock', 'discontinued'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt fields
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Add some helper methods
inventorySchema.methods.updateStock = async function(quantity) {
    if (this.quantity + quantity < 0) {
        throw new Error('Insufficient stock');
    }
    this.quantity += quantity;
    return this.save();
};

inventorySchema.methods.isAvailable = function(requestedQuantity) {
    return this.isActive && this.quantity >= requestedQuantity;
};

inventorySchema.statics.findByTag = function(tag) {
    return this.find({ tags: tag, isActive: true });
};

inventorySchema.statics.findLowStock = function(threshold = 10) {
    return this.find({ 
        quantity: { $lt: threshold },
        isActive: true 
    });
};

module.exports = mongoose.model('Inventory', inventorySchema);