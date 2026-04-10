const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protectPartner } = require('../middleware/auth');

// GET all products (with optional category filter) - Public
router.get('/', productController.getAllProducts);

router.use(protectPartner);

// GET single product
router.get('/:id', productController.getProductById);

// POST add new product
router.post('/', productController.createProduct);

// PUT full update product
router.put('/:id', productController.updateProduct);

// PUT toggle availability
router.put('/:id/toggle', productController.toggleProductAvailability);

// PUT toggle ban status
router.put('/:id/ban', productController.toggleProductBan);

// DELETE product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
