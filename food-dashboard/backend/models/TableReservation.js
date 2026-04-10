const mongoose = require('mongoose');

const TableReservationSchema = new mongoose.Schema({
    partnerId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        index: true // ID of the logged-in user who made the reservation
    },
    customerName: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    feeAmount: {
        type: Number,
        default: 0
    },
    paymentId: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('TableReservation', TableReservationSchema);
