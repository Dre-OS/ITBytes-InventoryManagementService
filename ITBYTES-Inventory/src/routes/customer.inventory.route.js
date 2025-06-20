const express = require('express');
const router = express.Router();
const customerInventoryController = require('../controllers/customer.inventory.controllers');

// Customer routes
router.get('/products', customerInventoryController.getAvailableProducts);
router.get('/products/:productId', customerInventoryController.getProductDetails);
router.post('/check-availability', customerInventoryController.checkAvailability);
router.post('/order', customerInventoryController.processOrder);

module.exports = router;