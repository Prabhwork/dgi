const express = require('express');
const {
    getGlobalSettings,
    updateGlobalSettings,
    getLiveListingCount
} = require('../controllers/globalSettingsController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(getGlobalSettings)
    .put(protect, authorize('admin'), updateGlobalSettings);

router
    .route('/live-listing')
    .get(getLiveListingCount);

module.exports = router;
