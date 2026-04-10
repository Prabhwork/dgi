const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protectPartner } = require('../middleware/auth');

// GET all settings (Public)
router.get('/', settingsController.getSettings);

router.use(protectPartner);

// PUT partial update settings
router.put('/', settingsController.updateSettings);

// PUT toggle live status
router.put('/toggle-live', settingsController.toggleLiveStatus);

// PUT toggle auto-accept
router.put('/toggle-auto-accept', settingsController.toggleAutoAccept);

// PUT toggle KOT
router.put('/toggle-kot', settingsController.toggleKOT);

// PUT update notification preferences
router.put('/notifications', settingsController.updateNotifications);

// PUT update all business hours
router.put('/hours', settingsController.updateBusinessHours);

// PUT update specific day hours
router.put('/hours/:day', settingsController.updateDayHours);

// PUT update compliance details
router.put('/compliance', settingsController.updateCompliance);

module.exports = router;
