const Inventory = require("../models/inventory.model");
const amqp = require("amqplib");
const { connect, composePublisher } = require("rabbitmq-publisher");

const amqpuri = process.env.AMQP_URI || "amqp://guest:guest@localhost:5672";


// Create a server object to store the connection
const server = {
  connection: null,
  channel: null,
};

// Initialize connection
async function initRabbitMQ() {
  try {
    const { connection, channel } = await connect(amqpuri);
    // const channel = await connection.createChannel();
    server.connection = connection;
    server.channel = channel;
    console.log("Connected to RabbitMQ Publisher successfully");
  } catch (err) {
    console.error("Failed to connect to RabbitMQ:", err);
  }
}

// Initialize immediately
initRabbitMQ();

function createTopicPublisher(routingKey, exchange, queueName, options) {
  return composePublisher({
    exchange: exchange,
    exchangeType: "topic",
    connectionUri: amqpuri,
    routingKey: routingKey,
    queue: queueName,
    options: options || {
      durable: true,
      exclusive: false,
      autoDelete: false,
    },
  });
}


const publisher = {
  auditError: createTopicPublisher(
    "audit.error",
    "audit",
    "audit-events",
    null
  ),
  auditInfo: createTopicPublisher(
    "audit.info",
    "audit",
    "audit-events",
    null
  ),
  inventoryUpdated: createTopicPublisher(
    "inventory.stock.updated",
    "inventory",
    "inventory-events",
    null
  ),
  inventoryOutOfStock: createTopicPublisher(
    "inventory.stock.out_of_stock",
    "inventory",
    "inventory-events",
    null
  ),
};

function audit(action, from, status, message) {
  const auditFormat = {
    action: action,
    from: from,
    status: status,
    message: message
  }

  if (status === "error") {
    publisher.auditError(
      server.channel,
      Buffer.from(JSON.stringify(auditFormat))
    );
  } else {
    publisher.auditInfo(
      server.channel,
      Buffer.from(JSON.stringify(auditFormat))
    );
  }
  console.log(`Audit log: ${action} - ${from} - ${status} - ${message}`);
  return auditFormat;
}


const MessagingController = {
  orderCreated: async (req, res) => {
    try {
      console.log("Order created event received:");
      const order = req.body;
      const itemAvailability = [];
      order.orders.map(async (item) => {
        const currentInventory = await Inventory.findById(item.itemId);
        if (!currentInventory) {
          audit(
            "orderCreated",
            "orderEvents",
            "error",
            `Inventory item with ID ${item.itemId} not found`
          );
          throw new Error(`Inventory item with ID ${item.itemId} not found`);
        }
        if (currentInventory.quantity < item.quantity) {
          itemAvailability.push(true);
        } else {
          itemAvailability.push(false);
        }
      });


      if (itemAvailability.includes(false)) {
        audit(
          "orderCreated",
          "orderEvents",
          "error",
          `One or more items in the order are out of stock \n ${JSON.stringify(order.orders)}`
        );
        // Respond with 400 Bad Request if any item is out of stock
        res.awknowledge = false; // Set acknowledgment flag to false
        publisher.inventoryOutOfStock(
          server.channel,
          Buffer.from(JSON.stringify(req.body))
        );

        return res.status(400).end();
      } else {
        try {
          const bulkOps = order.orders.map((item) => ({
            updateOne: {
              filter: { _id: item.itemId },
              update: { $inc: { quantity: -item.quantity } },
            },
          }));

          const bulkResult = await Inventory.bulkWrite(bulkOps);
          console.log("Inventory updated successfully");
          publisher.inventoryUpdated(server.channel, Buffer.from(JSON.stringify(bulkResult)));
          audit(
            "orderCreated",
            "orderEvents",
            "success",
            `Inventory updated successfully for order: \n ${JSON.stringify(bulkResult)}`,
          );
          
          publisher.inventoryUpdated(
            server.channel,
            Buffer.from(JSON.stringify(req.body))
          );
          res.awknowledge = true; // Set acknowledgment flag to true
          return res.status(201).end();
        } catch (error) {
          audit(
            "orderCreated",
            "orderEvents",
            "error",
            `Error updating inventory: ${error.message}`
          );
          res.awknowledge = false; // Set acknowledgment flag to false
          console.error("Error updating inventory:", error);
          return res.status(500).end();
        }
      }
      // audit("orderCreated", "error", `Error processing order: ${error.message}`);
      res.awknowledge = false; // Set acknowledgment flag to false
      res.status(500).end();
    } catch (error) {
      console.error("Error processing order creation:", error);
      audit(
        "orderCreated",
        "orderEvents",
        "error",
        `Error processing order: ${error.message}`
      );
      res.awknowledge = false;
      res.status(500).end();
    }
  },
  orderCancelled: async (req, res) => {
    try {
      console.log("Order cancelled event received:");
      const order = req.body;
      
      try {
        // For cancelled orders, we need to add the quantities back to inventory
        const bulkOps = order.orders.map((item) => ({
          updateOne: {
            filter: { _id: item.itemId },
            update: { $inc: { quantity: item.quantity } }, // Adding back to inventory
          },
        }));

        await Inventory.bulkWrite(bulkOps);
        console.log("Inventory restored successfully for cancelled order");
        
        // Publish inventory update event
        publisher.inventoryUpdated(
          server.channel,
          Buffer.from(JSON.stringify(order))
        );
        audit(
          "orderCancelled",
          "orderEvents",
          "success",
          `Inventory restored successfully for cancelled order ${JSON.stringify(order)}`
        );
        // Respond with 200 OK
        res.awknowledge = true; // Set acknowledgment flag to true
        
        res.status(200).end();
      } catch (error) {
        console.error("Error restoring inventory:", error);
        audit(
          "orderCancelled",
          "orderEvents",
          "error",
          `Error restoring inventory for cancelled order: ${error.message}`
        );
        res.status(500).end();
      }
    } catch (error) {
      console.error("Error processing order cancellation:", error);
      res.status(500).end();
    }
  },

  // paymentSuccess: async (req, res) => {
  //   try {
  //     console.log('Payment success event received:');
  //     publisher.inventoryUpdated(server.channel, Buffer.from(JSON.stringify(req.body)));
  //     const { id, quantity } = req.body;
  //     const inventory = await Inventory.findById(id);

  //     if (!inventory) {
  //       return res.status(404).json({ error: 'Inventory not found' });
  //     }

  //     try {
  //       await inventory.updateStock(quantity);

  //       // Publish inventory update event
  //       await publisher.inventoryUpdated({
  //         id: inventory.id,
  //         name: inventory.name,
  //         quantity: inventory.quantity,
  //         price: inventory.price,
  //         category: inventory.category,
  //         tags: inventory.tags,
  //         isActive: inventory.isActive,
  //         status: 'updated',
  //         timestamp: new Date().toISOString()
  //       });

  //       // Check for out of stock
  //       if (inventory.quantity === 0) {
  //         await publisher.inventoryOutOfStock({
  //           id: inventory.id,
  //           name: inventory.name,
  //           category: inventory.category,
  //           status: 'out_of_stock',
  //           timestamp: new Date().toISOString()
  //         });
  //       }
  //       res.awknowledged = true;
  //       res.status(201).end();
  //     } catch (stockError) {
  //       res.awknowledged = false;
  //       return res.status(400).json({
  //         error: stockError.message,
  //         code: 'INSUFFICIENT_STOCK'
  //       });
  //     }
  //   }catch (error) {
  //     console.error('Error processing payment success:', error);
  //     res.status(500).end();
  //   }
  // }
};

module.exports = {
  server,
  publisher,
  MessagingController,
};
