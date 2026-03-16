const express = require('express');
const {
    getSubcategories,
    getSubcategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory
} = require('../controllers/subcategoryController');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Subcategory = require('../models/Subcategory');

// Public routes
router
    .route('/')
    .get(advancedResults(Subcategory, { path: 'category', select: 'name description' }), getSubcategories);

router
    .route('/:id')
    .get(getSubcategory);

// Protected routes
router.use(protect);

router
    .route('/')
    .post(createSubcategory);

router
    .route('/:id')
    .put(updateSubcategory)
    .delete(deleteSubcategory);

module.exports = router;

