const express = require('express');
const {
    getGoogleCategories,
    getGoogleCategory,
    createGoogleCategory,
    updateGoogleCategory,
    deleteGoogleCategory
} = require('../controllers/googleCategoryController');

const router = express.Router();

// Include other resource routers
const subcategoryRouter = require('./subcategoryRoutes');

// Re-route into other resource routers
router.use('/:googleCategoryId/subcategories', subcategoryRouter);

const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const GoogleCategory = require('../models/GoogleCategory');

router
    .route('/')
    .get(advancedResults(GoogleCategory), getGoogleCategories)
    .post(protect, createGoogleCategory);

router
    .route('/:id')
    .get(getGoogleCategory)
    .put(protect, updateGoogleCategory)
    .delete(protect, deleteGoogleCategory);

module.exports = router;
