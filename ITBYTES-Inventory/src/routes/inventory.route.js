const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

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



/**
 * @swagger
 * /api/inventory/product-in:
 *   post:
 *     summary: Create a new product input request
 *     tags: [Inventory In]
 *     description: Creates a new product input request with pending approval status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the product
 *               quantity:
 *                 type: number
 *                 description: Quantity of the product
 *     responses:
 *       201:
 *         description: Product input request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The auto-generated id
 *                 name:
 *                   type: string
 *                   description: Product name
 *                 quantity:
 *                   type: number
 *                   description: Product quantity
 *                 isApproved:
 *                   type: boolean
 *                   description: Approval status (default false)
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Name and quantity are required
 *                 code:
 *                   type: string
 *                   example: VALIDATION_ERROR
 */
router.post('/product-in', inventoryController.createProductIn);

/**
 * @swagger
 * /api/inventory/product-in/{id}:
 *   put:
 *     summary: Update a product input request
 *     tags: [Inventory In]
 *     description: Updates an existing product input including its details and approval status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product input ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the product
 *               quantity:
 *                 type: number
 *                 description: Updated quantity
 *               isApproved:
 *                 type: boolean
 *                 description: Updated approval status
 *     responses:
 *       200:
 *         description: Product input updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The product input ID
 *                 name:
 *                   type: string
 *                   description: Updated product name
 *                 quantity:
 *                   type: number
 *                   description: Updated quantity
 *                 isApproved:
 *                   type: boolean
 *                   description: Updated approval status
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *                   description: Update timestamp
 *       400:
 *         description: Invalid request or ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid product ID
 *                 code:
 *                   type: string
 *                   example: UPDATE_ERROR
 *       404:
 *         description: Product input not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product not found
 *                 code:
 *                   type: string
 *                   example: NOT_FOUND
 */
router.put('/product-in/:id', inventoryController.updateProductIn);

/**
 * @swagger
 * /api/inventory/products/in:
 *   post:
 *     summary: Add stock to existing product by name
 *     tags: [Inventory In]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - name
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the existing product
 *               name:
 *                 type: string
 *                 description: Name of the product to add stock to
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: Quantity to add to existing stock
 *     responses:
 *       200:
 *         description: Stock added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
 *       400:
 *         description: Invalid input
 */
router.post('/products/in', inventoryController.addStockWhenNameExist);


/**
 * @swagger
 * /api/inventory/product-in:
 *   get:
 *     summary: Get all product input requests
 *     tags: [Inventory In]
 *     description: Retrieves a list of all product input requests, including pending and approved ones
 *     responses:
 *       200:
 *         description: List of product input requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The auto-generated id
 *                   name:
 *                     type: string
 *                     description: Product name
 *                   quantity:
 *                     type: number
 *                     description: Product quantity
 *                   isApproved:
 *                     type: boolean
 *                     description: Approval status
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation timestamp
 *                   lastUpdated:
 *                     type: string
 *                     format: date-time
 *                     description: Last update timestamp
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve product input requests
 *                 code:
 *                   type: string
 *                   example: SERVER_ERROR
 */
router.get('/product-in', inventoryController.getProductsIn);

/**
 * @swagger
 * /api/inventory/product-in/exists:
 *   get:
 *     summary: Check if a product exists by productId
 *     tags: [Inventory In]
 *     description: Verifies if a product with the given productId exists in the inventory
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The productId to check
 *     responses:
 *       200:
 *         description: Product existence check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 exists:
 *                   type: boolean
 *                   description: Whether the product exists
 *                 product:
 *                   type: object
 *                   description: Product details if found, null if not found
 *                   nullable: true
 *       400:
 *         description: Invalid productId format
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
 *                   example: Invalid productId format
 *                 code:
 *                   type: string
 *                   example: INVALID_ID
 */
router.get('/product-in/exists', inventoryController.confirmExistingProduct);

/**
 * @swagger
 * /api/inventory/product-in/{id}:
 *   delete:
 *     summary: Soft delete a product input request
 *     tags: [Inventory In]
 *     description: Marks a product input request as deleted (soft delete)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product input request to delete
 *     responses:
 *       200:
 *         description: Product input request deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product deleted successfully
 *       404:
 *         description: Product input request not found
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
 *                   example: Product not found
 *                 code:
 *                   type: string
 *                   example: NOT_FOUND
 *       400:
 *         description: Invalid ID format
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
 *                   example: Invalid ID format
 *                 code:
 *                   type: string
 *                   example: INVALID_ID
 */
router.delete('/product-in/:id', inventoryController.deleteProductIn);



// Export the router
module.exports = router;