const express = require('express');
const {
    getFeatures,
    getFeature,
    createFeature,
    updateFeature,
    deleteFeature
} = require('../controllers/featureController');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Feature = require('../models/Feature');

// Public routes
router
    .route('/')
    .get(advancedResults(Feature, { path: 'category', select: 'name description icon' }), getFeatures);

router
    .route('/:id')
    .get(getFeature);

// Protected routes
router.use(protect);

router
    .route('/')
    .post(createFeature);

router
    .route('/:id')
    .put(updateFeature)
    .delete(deleteFeature);

module.exports = router;
