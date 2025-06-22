const { publishMessage, QUEUES } = require('../../../src/configs/rabbitmq.config');
const Inventory = require('../models/inventory.model');

// Event handlers
const handleOrderCreated = async (orderData) => {
    try {
        const { items } = orderData;
        
        // Reserve inventory for each item
        for (const item of items) {
            const product = await Inventory.findOne({ productId: item.productId });
            
            if (!product) {
                throw new Error(`Product ${item.productId} not found`);
            }
            
            if (product.quantity < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.productId}`);
            }
            
            // Reserve the inventory
            product.quantity -= item.quantity;
            await product.save();

            // Check if stock is low after reservation
            if (product.quantity < 10) {
                await publishMessage(QUEUES.INVENTORY_LOW_STOCK, {
                    productId: product.productId,
                    productName: product.productName,
                    currentStock: product.quantity
                });
            }
        }

        // Notify about inventory update
        await publishMessage(QUEUES.INVENTORY_UPDATED, {
            orderId: orderData.orderId,
            status: 'reserved',
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Error handling order creation:', error);
        // Publish event about inventory reservation failure
        await publishMessage(QUEUES.INVENTORY_UPDATED, {
            orderId: orderData.orderId,
            status: 'reservation_failed',
            error: error.message,
            timestamp: new Date()
        });
        throw error;
    }
};

const handleOrderCancelled = async (orderData) => {
    try {
        const { items } = orderData;
        
        // Return inventory for each item
        for (const item of items) {
            const product = await Inventory.findOne({ productId: item.productId });
            
            if (product) {
                product.quantity += item.quantity;
                await product.save();
            }
        }

        // Notify about inventory update
        await publishMessage(QUEUES.INVENTORY_UPDATED, {
            orderId: orderData.orderId,
            status: 'returned',
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Error handling order cancellation:', error);
        throw error;
    }
};

const handlePaymentConfirmed = async (paymentData) => {
    try {
        // Payment confirmed, inventory has already been reserved
        // Just publish a confirmation event
        await publishMessage(QUEUES.INVENTORY_UPDATED, {
            orderId: paymentData.orderId,
            status: 'confirmed',
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error handling payment confirmation:', error);
        throw error;
    }
};

const handlePaymentFailed = async (paymentData) => {
    // If payment fails, handle it the same way as order cancellation
    await handleOrderCancelled(paymentData);
};

module.exports = {
    handleOrderCreated,
    handleOrderCancelled,
    handlePaymentConfirmed,
    handlePaymentFailed
};