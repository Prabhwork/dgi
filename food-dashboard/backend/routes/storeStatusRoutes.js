const express = require('express');
const router = express.Router();
const storeStatusController = require('../controllers/storeStatusController');
const { protectPartner } = require('../middleware/auth');

// GET store status (Public)
router.get('/', storeStatusController.getStoreStatus);

router.use(protectPartner);

// PUT update store status
router.put('/', storeStatusController.updateStoreStatus);

// PUT toggle open
router.put('/toggle-open', storeStatusController.toggleOpen);

// PUT toggle busy
router.put('/toggle-busy', storeStatusController.toggleBusy);

// PUT toggle mute
router.put('/toggle-mute', storeStatusController.toggleMute);

module.exports = router;
