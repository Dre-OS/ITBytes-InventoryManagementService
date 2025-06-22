const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Queue names
const QUEUES = {
    ORDER_CREATED: 'order.created',
    ORDER_CANCELLED: 'order.cancelled',
    PAYMENT_CONFIRMED: 'payment.confirmed',
    PAYMENT_FAILED: 'payment.failed',
    INVENTORY_UPDATED: 'inventory.updated',
    INVENTORY_LOW_STOCK: 'inventory.low_stock'
};

let channel, connection;

async function connectQueue() {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        // Assert all queues
        for (const queue of Object.values(QUEUES)) {
            await channel.assertQueue(queue, {
                durable: true
            });
        }

        console.log('RabbitMQ connection established');
        return channel;
    } catch (error) {
        console.error('RabbitMQ connection error:', error);
        throw error;
    }
}

async function publishMessage(queue, message) {
    try {
        if (!channel) {
            await connectQueue();
        }
        await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
        console.error('Error publishing message:', error);
        throw error;
    }
}

async function consumeMessage(queue, callback) {
    try {
        if (!channel) {
            await connectQueue();
        }
        await channel.consume(queue, (data) => {
            const message = JSON.parse(data.content);
            callback(message);
            channel.ack(data);
        });
    } catch (error) {
        console.error('Error consuming message:', error);
        throw error;
    }
}

process.on('exit', () => {
    if (channel) channel.close();
    if (connection) connection.close();
});

module.exports = {
    connectQueue,
    publishMessage,
    consumeMessage,
    QUEUES
};