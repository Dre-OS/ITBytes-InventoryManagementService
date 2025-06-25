const mongoose = require('mongoose');

// Maximum file size (10MB in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed image types
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

const inventorySchema = new mongoose.Schema({
    image: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity cannot be less than 1']
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    tags: {
        type: [String],
        required: true
    },
    category: {
        type: String,
        required: false,
    },   
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Pre-save middleware to prevent negative quantities
inventorySchema.pre('save', function(next) {
    if (this.quantity < 1) {
        next(new Error('Quantity cannot be less than 1'));
    }
    
    // Additional validation for images
    if (this.image && this.image.data) {
        if (this.image.data.length > MAX_FILE_SIZE) {
            next(new Error(`Image file size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`));
        }
        if (!this.image.contentType || !ALLOWED_IMAGE_TYPES.includes(this.image.contentType)) {
            next(new Error(`Image type must be one of: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
        }
    }
    
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema);