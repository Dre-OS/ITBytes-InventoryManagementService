const Inventory = require("../models/inventory.model");
const amqp = require('amqplib');
const {connect , composePublisher } = require('rabbitmq-publisher');

const amqpuri = process.env.AMQP_URI || 'amqp://guest:guest@localhost:5672';

// Create a server object to store the connection
const server = { 
  connection: null, 
  channel: null 
};

// Initialize connection
async function initRabbitMQ() {
  try {
    const {connection, channel} = await connect(amqpuri);
    // const channel = await connection.createChannel();
    server.connection = connection;
    server.channel = channel;
    console.log('Connected to RabbitMQ Publisher successfully');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
  }
}

// Initialize immediately
initRabbitMQ();

function createTopicPublisher(routingKey, exchange, queueName, options) {
  return composePublisher({
    exchange: exchange,
    exchangeType: 'topic',
    connectionUri: amqpuri,
    routingKey: routingKey,
    queue: queueName,
    options: options || {
      durable: true,
      exclusive: false,
      autoDelete: false
    }
  });
}

const publisher = {
  inventoryUpdated: createTopicPublisher('inventory.updated', 'inventory', 'inventory-events', null),
  inventoryOutOfStock: createTopicPublisher('inventory.out_of_stock', 'inventory', 'inventory-events', null)
};

const MessagingController = {
  paymentSuccess: async (req, res) => {
    try {
      console.log('Payment success event received:');
      publisher.inventoryUpdated(server.channel, Buffer.from(JSON.stringify(req.body)));
      const { id, quantity } = req.body;
      const inventory = await Inventory.findById(id);

      if (!inventory) {
        return res.status(404).json({ error: 'Inventory not found' });
      }

      try {
        await inventory.updateStock(quantity);

        // Publish inventory update event
        await publisher.inventoryUpdated({
          id: inventory.id,
          name: inventory.name,
          quantity: inventory.quantity,
          price: inventory.price,
          category: inventory.category,
          tags: inventory.tags,
          isActive: inventory.isActive,
          status: 'updated',
          timestamp: new Date().toISOString()
        });

        // Check for out of stock
        if (inventory.quantity === 0) {
          await publisher.inventoryOutOfStock({
            id: inventory.id,
            name: inventory.name,
            category: inventory.category,
            status: 'out_of_stock',
            timestamp: new Date().toISOString()
          });
        }
        res.awknowledged = true;
        res.status(201).end();
      } catch (stockError) {
        res.awknowledged = false;
        return res.status(400).json({ 
          error: stockError.message,
          code: 'INSUFFICIENT_STOCK'
        });
      }
    }catch (error) {
      console.error('Error processing payment success:', error);
      res.status(500).end();
    }
  }
};

module.exports = {
  server,
  publisher,
  MessagingController,
};  