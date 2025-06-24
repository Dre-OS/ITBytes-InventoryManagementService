const express = require('express');
const router = express.Router();
const customerInventoryController = require('../controllers/customer.inventory.controllers');

/**
 * @swagger
 * /api/customer/inventory/products:
 *   get:
 *     summary: Get all available products
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: List of available products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InventoryResponse'
 *       500:
 *         description: Server error
 */
router.get('/products', customerInventoryController.getAvailableProducts);

/**
 * @swagger
 * /api/customer/inventory/products/{id}:
 *   get:
 *     summary: Get product details
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the product
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryResponse'
 *       404:
 *         description: Product not found or out of stock
 */
router.get('/products/:id', customerInventoryController.getProductDetails);

/**
 * @swagger
 * /api/customer/inventory/check-availability:
 *   post:
 *     summary: Check product availability
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['id', 'quantity']
 *             properties:
 *               id:
 *                 type: string
 *                 description: MongoDB _id of the product
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: Required quantity
 *     responses:
 *       200:
 *         description: Availability check result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvailabilityResponse'
 *       404:
 *         description: Product not found
 */
router.post('/check-availability', customerInventoryController.checkAvailability);

/**
 * @swagger
 * /api/customer/inventory/order:
 *   post:
 *     summary: Process an order
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['id', 'quantity']
 *             properties:
 *               id:
 *                 type: string
 *                 description: MongoDB _id of the product
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: Quantity to order
 *               customerName:
 *                 type: string
 *                 description: Name of the customer
 *               customerEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the customer
 *     responses:
 *       200:
 *         description: Order processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Invalid request or insufficient stock
 *       404:
 *         description: Product not found
 */
router.post('/order', customerInventoryController.processOrder);

module.exports = router;