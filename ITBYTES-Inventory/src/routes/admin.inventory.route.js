const express = require('express');
const router = express.Router();
const adminInventoryController = require('../controllers/admin.inventory.controllers');

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminInventoryInput:
 *       type: object
 *       properties:
 *         image:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *               description: URL link to the image
 *             data:
 *               type: string
 *               format: base64
 *               description: Base64 encoded image data
 *         name:
 *           type: string
 *           required: true
 *           description: Name of the product
 *         quantity:
 *           type: number
 *           minimum: 1
 *           required: true
 *           description: Current stock quantity
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: number
 *           minimum: 0
 *           required: true
 *           description: Product price
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           required: true
 *           description: Product tags
 *         category:
 *           type: string
 *           description: Product category
 *         isActive:
 *           type: boolean
 *           description: Product status
 *           default: true
 */

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
 *                 $ref: '#/components/schemas/AdminInventoryInput'
 *       500:
 *         description: Server error
 */
router.get('/products', adminInventoryController.getAllProducts);

/**
 * @swagger
 * /api/admin/inventory/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Admin]
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
 *               $ref: '#/components/schemas/AdminInventoryInput'
 *       404:
 *         description: Product not found
 */
router.get('/products/:id', adminInventoryController.getProduct);

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
 *             $ref: '#/components/schemas/AdminInventoryInput'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminInventoryInput'
 *       400:
 *         description: Invalid input
 */
router.post('/products', adminInventoryController.createProduct);

/**
 * @swagger
 * /api/admin/inventory/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminInventoryInput'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminInventoryInput'
 *       404:
 *         description: Product not found
 *       400:
 *         description: Invalid input
 */
router.put('/products/:id', adminInventoryController.updateProduct);

/**
 * @swagger
 * /api/admin/inventory/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the product
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', adminInventoryController.deleteProduct);

/**
 * @swagger
 * /api/admin/inventory/products/{id}/stock:
 *   put:
 *     summary: Update product stock
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB _id of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['quantity']
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminInventoryInput'
 *       404:
 *         description: Product not found
 */
router.put('/products/:id/stock', adminInventoryController.updateStock);

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