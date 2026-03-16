const express = require('express');
const {
    getPageDetails,
    getPageDetail,
    createPageDetail,
    updatePageDetail,
    deletePageDetail
} = require('../controllers/pageDetailController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
    .route('/')
    .get(getPageDetails)
    .post(protect, authorize('admin'), upload.single('image'), createPageDetail);

router
    .route('/:id')
    .get(getPageDetail)
    .put(protect, authorize('admin'), upload.single('image'), updatePageDetail)
    .delete(protect, authorize('admin'), deletePageDetail);

module.exports = router;
