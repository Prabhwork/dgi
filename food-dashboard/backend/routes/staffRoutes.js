const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { protectPartner } = require('../middleware/auth');

router.use(protectPartner);

// GET all staff
router.get('/', staffController.getAllStaff);

// GET single staff member
router.get('/:id', staffController.getStaffById);

// POST add new staff
router.post('/', staffController.createStaff);

// PUT full update staff
router.put('/:id', staffController.updateStaff);

// Attendance Management
router.put('/:id/attendance', staffController.updateStaffAttendance);
router.get('/:id/attendance', staffController.getStaffMonthlyAttendance);

// Salary Settlement
router.post('/:id/settle', staffController.processSettlement);
router.get('/meta/settlements', staffController.getSettlements);

// PUT update salary advance
router.put('/:id/advance', staffController.updateStaffAdvance);

// POST bulk mark attendance for today
router.post('/bulk-mark', staffController.bulkMarkAttendance);

// DELETE staff member
router.delete('/:id', staffController.deleteStaff);

// GET payroll summary
router.get('/meta/payroll', staffController.getPayrollSummary);

module.exports = router;
