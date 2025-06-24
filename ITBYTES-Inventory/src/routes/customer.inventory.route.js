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
 */
router.get('/products', customerInventoryController.getAvailableProducts);

/**
 * @swagger
 * /api/customer/inventory/products/{ItemId}:
 *   get:
 *     summary: Get product details
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: ItemId
 *         required: true
 *         schema:
 *           type: string
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
router.get('/products/:ItemId', customerInventoryController.getProductDetails);

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
 *             required: ['ItemId', 'Quantity']
 *             properties:
 *               ItemId:
 *                 type: string
 *               Quantity:
 *                 type: number
 *                 minimum: 1
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
 *             $ref: '#/components/schemas/OrderRequest'
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