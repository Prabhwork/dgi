const express = require('express');
const {
    getDineoutSettings,
    updateDineoutSettings,
    getReservations,
    createReservation,
    updateReservationStatus,
    getReservationsByUserId
} = require('../controllers/dineoutController');
const { protectPartner } = require('../middleware/auth');

const router = express.Router();

// Reservations (Public Facing)
router.post('/reservations', createReservation);

// GET reservations for a specific user - Public (for user profile)
router.get('/reservations/user/:userId', getReservationsByUserId);

// Settings (Public Read)
router.get('/settings', getDineoutSettings);

router.use(protectPartner);

// Updates
router.put('/settings', updateDineoutSettings);

// Reservations (Partner Management)
router.get('/reservations', getReservations);
router.patch('/reservations/:id', updateReservationStatus);

module.exports = router;
