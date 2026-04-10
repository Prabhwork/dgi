const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protectPartner } = require('../middleware/auth');

// GET all categories (active only by default) - Public
router.get('/', categoryController.getAllCategories);

router.use(protectPartner);

// GET single category
router.get('/:id', categoryController.getCategoryById);

// POST create a new category
router.post('/', categoryController.createCategory);

// PUT update category
router.put('/:id', categoryController.updateCategory);

// DELETE category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
