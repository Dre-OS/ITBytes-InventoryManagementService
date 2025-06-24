const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    image: {
        url: {
            type: String,
            required: false,
            validate: {
                validator: function(v) {
                    return !v || /^(http|https):\/\/[^ "]+$/.test(v);
                },
                message: props => `${props.value} is not a valid URL!`
            }
        },
        data: {
            type: String,
            required: false,
            validate: {
                validator: function(v) {
                    return !v || /^data:image\/(jpeg|jpg|png|gif);base64,/.test(v);
                },
                message: props => 'Invalid base64 image format!'
            }
        }
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
        required:false,
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
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema);