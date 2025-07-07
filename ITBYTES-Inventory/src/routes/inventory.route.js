const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const rabbitmq = require('../configs/rabbitmq.config');

/**
 * @swagger
 * /api/inventory/products:
 *   get:
 *     summary: Get all products with filtering options
 *     description: Retrieve products with optional filtering for active status and stock availability
 *     tags: [Inventory]
 *     parameters:
 *       - in: query    
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status (true/false). If not provided, returns all products
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter for in-stock items only (quantity > 0)
 *     responses:
 *       200:
 *         description: List of products with metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   description: Total number of products in the response
 *                 active:
 *                   type: number
 *                   description: Number of active products
 *                 inactive:
 *                   type: number
 *                   description: Number of inactive products
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductResponse'
 *       500:
 *         description: Server error while fetching products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/products', inventoryController.getAllProducts);

/**
 * @swagger
 * /api/inventory/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */
router.get('/products/:id', inventoryController.getProduct);

/**
 * @swagger
 * /api/inventory/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */
router.post('/products', inventoryController.createProduct);

/**
 * @swagger
 * /api/inventory/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */
router.put('/products/:id', inventoryController.updateProduct);

/**
 * @swagger
 * /api/inventory/products/{id}:
 *   delete:
 *     summary: Soft delete a product
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 product:
 *                   $ref: '#/components/schemas/ProductResponse'
 */
router.delete('/products/:id', inventoryController.deleteProduct);

/**
 * @swagger
 * /api/inventory/check-availability:
 *   post:
 *     summary: Check product availability
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - quantity
 *             properties:
 *               id:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Availability check result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvailabilityResponse'
 */
router.post('/check-availability', inventoryController.checkAvailability);

/**
 * @swagger
 * /api/inventory/order:
 *   post:
 *     summary: Process an order
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Order processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 */
router.post('/order', inventoryController.processOrder);

/**
 * @swagger
 * /api/inventory/statistics:
 *   get:
 *     summary: Get inventory statistics
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Inventory statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Statistics'
 */
router.get('/statistics', inventoryController.getInventoryStats);

/**
 * @swagger
 * /api/inventory/test/rabbitmq:
 *   get:
 *     summary: Test RabbitMQ connection status
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: Connection test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the connection test was successful
 *                 status:
 *                   type: object
 *                   properties:
 *                     isConnected:
 *                       type: boolean
 *                       description: Current connection status to RabbitMQ
 *                     isConnecting:
 *                       type: boolean
 *                       description: Whether currently attempting to connect
 *                     reconnectAttempts:
 *                       type: integer
 *                       description: Number of reconnection attempts made
 *                     queues:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of available queues
 *       500:
 *         description: Connection test failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to test RabbitMQ connection
 */
router.get('/test/rabbitmq', inventoryController.testRabbitMQSend);

// Export the router
module.exports = router;