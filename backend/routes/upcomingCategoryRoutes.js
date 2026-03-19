const express = require('express');
const {
    getUpcomingCategories,
    getUpcomingCategory,
    createUpcomingCategory,
    updateUpcomingCategory,
    deleteUpcomingCategory
} = require('../controllers/upcomingCategoryController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
    .route('/')
    .get(getUpcomingCategories)
    .post(protect, authorize('admin'), upload.single('image'), createUpcomingCategory);

router
    .route('/:id')
    .get(getUpcomingCategory)
    .put(protect, authorize('admin'), upload.single('image'), updateUpcomingCategory)
    .delete(protect, authorize('admin'), deleteUpcomingCategory);

module.exports = router;
