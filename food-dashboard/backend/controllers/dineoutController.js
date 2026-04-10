const mongoose = require('mongoose');
const mainDb = require('../config/mainDb');
const DineoutSettings = require('../models/DineoutSettings');
const TableReservation = require('../models/TableReservation');
const Transaction = require('../models/Transaction');
const fcmService = require('../services/fcmService');

// @desc    Get Dineout Settings
// @route   GET /api/dineout/settings
// @access  Private/Partner
exports.getDineoutSettings = async (req, res) => {
    try {
        const partnerId = req.headers['x-partner-id'];
        if (!partnerId) {
            return res.status(400).json({ success: false, message: 'Partner ID Required' });
        }

        let settings = await DineoutSettings.findOne({ partnerId });
        
        // --- SUPER-ROBUST DBI SYNC LOGIC ---
        const timeToMinutes = (t) => {
            if (!t || typeof t !== 'string') return 0;
            // Clean string and handle both "11:00 AM" and "11:00"
            const clean = t.trim().toUpperCase();
            const parts = clean.split(/\s+/);
            const timePart = parts[0];
            const ampm = parts[1]; // Might be undefined

            let [hours, minutes] = timePart.split(':').map(Number);
            if (isNaN(hours)) return 0;
            if (isNaN(minutes)) minutes = 0;

            if (ampm) {
                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
            } else {
                // No AM/PM? Assume 24h format but handle edge cases
                if (hours === 12 && minutes === 0) hours = 12; // Noon
                // If it's a small number like 1-6 and no AM/PM, it could be PM, 
                // but usually DBI stores it clearly. 
            }
            return hours * 60 + minutes;
        };

        const formatMinutes = (m) => {
            let h = Math.floor(m / 60);
            let mins = m % 60;
            const period = h >= 12 ? 'PM' : 'AM';
            if (h > 12) h -= 12;
            if (h === 0) h = 12;
            return `${h}:${mins.toString().padStart(2, '0')} ${period}`;
        };

        let dbiOpening = "11:00 AM";
        let dbiClosing = "11:00 PM";
        let minTime = 1440; 
        let maxTime = 0;    

        try {
            const Settings = mongoose.model('Settings');
            let dbiSettings = await Settings.findOne({ partnerId });
            
            const ObjectId = require('mongoose').Types.ObjectId;
            const dbiBusiness = await mainDb.collection('businesses').findOne({ _id: new ObjectId(partnerId) });
            
            if (dbiBusiness && dbiBusiness.businessHours) {
                const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                DAYS.forEach(day => {
                    const d = dbiBusiness.businessHours[day];
                    if (d?.isOpen && d.slots) {
                        d.slots.forEach(s => {
                            if (s.open) {
                                const mins = timeToMinutes(s.open);
                                if (mins < minTime) { minTime = mins; dbiOpening = formatMinutes(mins); }
                            }
                            if (s.close) {
                                const mins = timeToMinutes(s.close);
                                // Midnight (00:00) is conceptually the end of the day (1440 mins) for "Closing" comparison
                                const compMins = (mins === 0) ? 1440 : mins;
                                if (compMins > maxTime) { 
                                    maxTime = compMins; 
                                    dbiClosing = formatMinutes(mins); 
                                }
                            }
                        });
                    }
                });
            }
        } catch (e) { console.error("Robust Sync Error:", e.message); }

        if (!settings) {
            settings = await DineoutSettings.create({
                partnerId,
                availableSlots: ["07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"],
                tableInventory: [{ capacity: 4, count: 5 }, { capacity: 2, count: 5 }],
                lunchOpening: dbiOpening,
                lunchClosing: '04:00 PM',
                dinnerOpening: '06:00 PM',
                dinnerClosing: dbiClosing,
                lunchSlots: ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"],
                dinnerSlots: ["07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"]
            });
        } else {
            // CONTINUOUS AUTO-SYNC: Always match DBI Profile timings
            let changed = false;

            // Initialize new shift slots if missing
            if (!settings.lunchSlots || settings.lunchSlots.length === 0) {
                settings.lunchSlots = ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM"];
                changed = true;
            }
            if (!settings.dinnerSlots || settings.dinnerSlots.length === 0) {
                settings.dinnerSlots = ["07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"];
                changed = true;
            }
            
            if (settings.lunchOpening !== dbiOpening) {
                settings.lunchOpening = dbiOpening;
                changed = true;
            }
            if (settings.dinnerClosing !== dbiClosing) {
                settings.dinnerClosing = dbiClosing;
                changed = true;
            }
            
            if (changed) await settings.save();
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update Dineout Settings
// @route   PUT /api/dineout/settings
// @access  Private/Partner
exports.updateDineoutSettings = async (req, res) => {
    try {
        const partnerId = req.headers['x-partner-id'];
        if (!partnerId) {
            return res.status(400).json({ success: false, message: 'Partner ID Required' });
        }

        const settings = await DineoutSettings.findOneAndUpdate(
            { partnerId },
            { ...req.body, partnerId }, // Ensure partnerId is not changed
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get Table Reservations
// @route   GET /api/dineout/reservations
// @access  Private/Partner
exports.getReservations = async (req, res) => {
    try {
        const partnerId = req.headers['x-partner-id'];
        if (!partnerId) {
            return res.status(400).json({ success: false, message: 'Partner ID Required' });
        }

        const reservations = await TableReservation.find({ partnerId }).sort({ date: -1, timeSlot: 1 });

        res.status(200).json({
            success: true,
            data: reservations
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create Reservation (Internal/User)
// @route   POST /api/dineout/reservations
// @access  Public (User Facing)
exports.createReservation = async (req, res) => {
    try {
        const { partnerId, customerName, customerPhone, guests, date, timeSlot, feeAmount, paymentId, userId } = req.body;

        if (!partnerId || !customerName || !customerPhone || !guests || !date || !timeSlot) {
            return res.status(400).json({ success: false, message: 'All fields required' });
        }

        // Generate a simple booking ID
        const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

        const reservation = await TableReservation.create({
            partnerId,
            userId: userId || null,
            customerName,
            customerPhone,
            guests,
            date,
            timeSlot,
            bookingId,
            feeAmount,
            paymentId
        });

        // Create a Transaction record if there is a fee
        if (feeAmount > 0) {
            try {
                // Generate a transaction ID
                const count = await Transaction.countDocuments({ partnerId });
                const txnId = `TXN-DIN-${partnerId.substring(0, 4).toUpperCase()}-${9900 + count + 1}`;
                
                await Transaction.create({
                    id: txnId,
                    partnerId,
                    orderId: bookingId, // Link to the booking ID for display
                    amount: feeAmount,
                    status: 'Paid',
                    method: 'Online', 
                    gatewayRef: paymentId,
                    date: new Date().toLocaleString()
                });
            } catch (txnError) {
                console.error("Failed to create transaction for reservation:", txnError);
                // We don't fail the whole request since the reservation is already saved
            }
        }

        // Trigger FCM Notification for New Reservation (to Admin/Partner)
        try {
            await fcmService.sendToTopic(`food-admin-${partnerId}`, {
                title: '🍽️ New Table Reservation!',
                body: `${customerName} booked a table for ${guests} guests on ${date} at ${timeSlot}`,
                partnerId: partnerId, // For persistence
                type: 'Reservation',
                data: { bookingId, type: 'NEW_RESERVATION' }
            });
        } catch (fcmErr) {
            console.error("FCM New Reservation Error:", fcmErr);
        }

        res.status(201).json({
            success: true,
            data: reservation
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Update Reservation Status
// @route   PATCH /api/dineout/reservations/:id
// @access  Private/Partner
exports.updateReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const reservation = await TableReservation.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        // Trigger FCM Notification for Status Change (to Customer)
        if (reservation.userId) {
            try {
                const userTokens = await mainDb.collection('fcmtokens').find({ userId: new mongoose.Types.ObjectId(reservation.userId) }).toArray();
                if (userTokens.length > 0) {
                    const tokens = userTokens.map(t => t.token);
                    const statusMessages = {
                        'Confirmed': `Your table for ${reservation.guests} guests has been confirmed! 🎫`,
                        'Arrived': 'Welcome! Your table is ready. Please proceed to the host desk. 👋',
                        'Cancelled': 'Your reservation has been cancelled. Please contact the restaurant for details. ❌'
                    };
                    
                    if (statusMessages[status]) {
                        await fcmService.sendMulticast(tokens, {
                            title: `Reservation ${status}`,
                            body: statusMessages[status],
                            userId: reservation.userId, // For persistence
                            type: 'Reservation',
                            data: { bookingId: reservation.bookingId, status }
                        });
                    }
                }
            } catch (fcmErr) {
                console.error("FCM Reservation Update Error:", fcmErr);
            }
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get Reservations for a specific User
// @route   GET /api/dineout/reservations/user/:userId
// @access  Public (User Facing)
exports.getReservationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }
        const reservations = await TableReservation.find({ userId }).sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, data: reservations });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
