const express = require('express');
const {
    getMainSubcategories,
    createMainSubcategory,
    updateMainSubcategory,
    deleteMainSubcategory
} = require('../controllers/mainSubcategoryController');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth');

// Public routes
router.route('/').get(getMainSubcategories);

// Protected routes
router.use(protect);
router.route('/').post(createMainSubcategory);
router.route('/:id').put(updateMainSubcategory).delete(deleteMainSubcategory);

module.exports = router;
