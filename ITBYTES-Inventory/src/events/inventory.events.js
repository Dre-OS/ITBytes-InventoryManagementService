const { publishMessage, QUEUES } = require('../configs/rabbitmq.config');
const Inventory = require('../models/inventory.model');


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
    handlePaymentConfirmed,
    handlePaymentFailed
};