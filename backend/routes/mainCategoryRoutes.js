const express = require('express');
const {
    getMainCategories,
    getMainCategory,
    createMainCategory,
    updateMainCategory,
    deleteMainCategory
} = require('../controllers/mainCategoryController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const MainCategory = require('../models/MainCategory');
const upload = require('../middleware/upload');

router
    .route('/')
    .get(advancedResults(MainCategory), getMainCategories)
    .post(protect, upload.single('image'), createMainCategory);

router
    .route('/:id')
    .get(getMainCategory)
    .put(protect, upload.single('image'), updateMainCategory)
    .delete(protect, deleteMainCategory);

module.exports = router;
