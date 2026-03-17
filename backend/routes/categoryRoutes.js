const express = require('express');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Category = require('../models/Category');

// router.use(protect);

router
    .route('/')
    .get(advancedResults(Category), getCategories)
    .post(protect, createCategory);

router
    .route('/:id')
    .get(getCategory)
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

module.exports = router;
