const express = require('express');
const router = express.Router();
const adminInventoryController = require('../controllers/admin.inventory.controllers');

// Admin routes
router.get('/products', adminInventoryController.getAllProducts);
router.get('/products/:productId', adminInventoryController.getProduct);
router.post('/products', adminInventoryController.createProduct);
router.put('/products/:productId', adminInventoryController.updateProduct);
router.delete('/products/:productId', adminInventoryController.deleteProduct);
router.put('/products/:productId/stock', adminInventoryController.updateStock);
router.get('/statistics', adminInventoryController.getInventoryStats);

module.exports = router;