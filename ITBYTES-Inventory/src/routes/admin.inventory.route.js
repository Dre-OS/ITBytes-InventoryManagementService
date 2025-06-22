const express = require('express');
const router = express.Router();
const adminInventoryController = require('../controllers/admin.inventory.controllers');

/**
 * @swagger
 * /api/admin/inventory/products:
 *   get:
 *     summary: Get all products
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *       500:
 *         description: Server error
 */
router.get('/products', adminInventoryController.getAllProducts);

/**
 * @swagger
 * /api/admin/inventory/products/{ItemId}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Admin]
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
 *               $ref: '#/components/schemas/Inventory'
 *       404:
 *         description: Product not found
 */
router.get('/products/:ItemId', adminInventoryController.getProduct);

/**
 * @swagger
 * /api/admin/inventory/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryResponse'
 *       400:
 *         description: Invalid input
 */
router.post('/products', adminInventoryController.createProduct);

/**
 * @swagger
 * /api/admin/inventory/products/{ItemId}:
 *   put:
 *     summary: Update a product
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: ItemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryResponse'
 *       404:
 *         description: Product not found
 */
router.put('/products/:ItemId', adminInventoryController.updateProduct);

/**
 * @swagger
 * /api/admin/inventory/products/{ItemId}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: ItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/products/:ItemId', adminInventoryController.deleteProduct);

/**
 * @swagger
 * /api/admin/inventory/products/{ItemId}/stock:
 *   put:
 *     summary: Update product stock
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: ItemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockUpdate'
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventoryResponse'
 *       404:
 *         description: Product not found
 */
router.put('/products/:ItemId/stock', adminInventoryController.updateStock);

/**
 * @swagger
 * /api/admin/inventory/statistics:
 *   get:
 *     summary: Get inventory statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Inventory statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalProducts:
 *                   type: number
 *                 totalItems:
 *                   type: number
 *                 averagePrice:
 *                   type: number
 *                 lowStock:
 *                   type: number
 */
router.get('/statistics', adminInventoryController.getInventoryStats);

module.exports = router;    