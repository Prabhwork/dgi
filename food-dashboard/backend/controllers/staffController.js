const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const Attendance = require('../models/Attendance');
const fcmService = require('../services/fcmService');
const Settlement = require('../models/Settlement');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || req.partnerId;

// GET all active staff (Partitioned by Partner)
exports.getAllStaff = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const filter = { partnerId, isSuspended: { $ne: true } };
    if (req.query.status) filter.status = req.query.status;
    const staff = await Staff.find(filter).sort({ id: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single staff member (enforcing partner isolation)
exports.getStaffById = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const member = await Staff.findOne({ _id: req.params.id, partnerId });
    if (!member) return res.status(404).json({ message: 'Staff member not found or access denied' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST add new staff (automatically assigning current partnerId)
exports.createStaff = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const count = await Staff.countDocuments({ partnerId });
    const newId = `ST-${partnerId.split('-')[0].toUpperCase()}-${String(count + 1).padStart(3, '0')}`;
    const staff = new Staff({ ...req.body, id: newId, partnerId });
    const saved = await staff.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT full update staff (enforcing partner isolation)
exports.updateStaff = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const member = await Staff.findOneAndUpdate(
      { _id: req.params.id, partnerId },
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!member) return res.status(404).json({ message: 'Staff member not found or access denied' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT set attendance (enforcing partner isolation)
exports.updateStaffAttendance = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { status } = req.body; // 'Present', 'Absent', 'Leave', 'Uninformed', 'None'
    const member = await Staff.findOne({ _id: req.params.id, partnerId });
    if (!member) return res.status(404).json({ message: 'Staff member not found or access denied' });
    
    member.status = status;
    
    // Create/Update Attendance Record for Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Attendance.findOneAndUpdate(
      { staffId: member.id, partnerId, date: today },
      { 
        status: status,
        month: today.getMonth() + 1,
        year: today.getFullYear()
      },
      { upsert: true, new: true }
    );
    
    const saved = await member.save();

    // Trigger FCM Notification for Attendance (to Partner)
    try {
        await fcmService.sendToTopic(`food-admin-${partnerId}`, {
            title: `👤 Attendance Update`,
            body: `${member.name} marked as ${status} for today.`,
            partnerId: partnerId,
            type: 'Staff',
            data: { staffId: member._id.toString(), status, type: 'ATTENDANCE' }
        });
    } catch (fcmErr) {
        console.error("FCM Attendance Error:", fcmErr);
    }

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST bulk mark attendance (Partitioned by Partner)
exports.bulkMarkAttendance = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const todayStr = new Date().toLocaleDateString('en-GB');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const staffList = await Staff.find({ partnerId, lastClockIn: { $ne: todayStr } });
    
    // Bulk upsert into Attendance collection
    const attendanceOps = staffList.map(s => ({
      updateOne: {
        filter: { staffId: s.id, partnerId, date: today },
        update: { 
          status: 'Present',
          month: today.getMonth() + 1,
          year: today.getFullYear() 
        },
        upsert: true
      }
    }));

    if (attendanceOps.length > 0) {
      await Attendance.bulkWrite(attendanceOps);
    }

    const result = await Staff.updateMany(
      { partnerId, lastClockIn: { $ne: todayStr } },
      { status: 'Present', lastClockIn: todayStr }
    );

    res.json({ message: `Staff from ${partnerId} marked present for today`, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT reset daily status (Partitioned by Partner)
exports.resetDailyStatus = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    await Staff.updateMany({ partnerId }, { status: 'None', lastClockIn: '' });
    res.json({ message: `Daily status reset for ${partnerId}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT update salary advance (enforcing partner isolation)
exports.updateStaffAdvance = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { advance } = req.body;
    if (typeof advance !== 'number') return res.status(400).json({ message: 'advance must be a number' });
    const member = await Staff.findOneAndUpdate(
      { _id: req.params.id, partnerId },
      { advance },
      { new: true }
    );
    if (!member) return res.status(404).json({ message: 'Staff member not found or access denied' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE staff member (Soft Delete / Partitioned)
exports.deleteStaff = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const result = await Staff.findOneAndUpdate(
      { _id: req.params.id, partnerId },
      { isSuspended: true },
      { new: true }
    );
    if (!result) return res.status(404).json({ message: 'Staff member not found or access denied' });
    res.json({ message: 'Staff member suspended in records', staff: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET payroll summary (Month specific / Partitioned)
exports.getPayrollSummary = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const staffList = await Staff.find({ partnerId, isSuspended: { $ne: true } });
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Fetch all attendance and settlements for the period once (enforcing partition)
    const [attendanceLogs, settlements] = await Promise.all([
      Attendance.find({ partnerId, month, year }),
      Settlement.find({ partnerId, month, year })
    ]);

    let totalBaseSalary = 0;
    let totalDeductions = 0;
    let totalAdvances = 0;

    const daysInMonth = new Date(year, month, 0).getDate();

    const staffWithCalculations = staffList.map(member => {
      const monthlyLogs = attendanceLogs.filter(log => log.staffId === member.id);
      
      const presentCount = monthlyLogs.filter(log => log.status === 'Present').length;
      const leaveCount = monthlyLogs.filter(log => log.status === 'Leave' || log.status === 'Absent').length;
      const uninformedCount = monthlyLogs.filter(log => log.status === 'Uninformed').length;
      
      const perDayRate = Math.round(member.salary / daysInMonth);
      
      // Rule: Pay = Worked Days + (Leave up to AllowedLeaves)
      const paidLeaves = Math.min(leaveCount, member.allowedLeaves || 0);
      const totalPaidDays = presentCount + paidLeaves;
      
      const earnings = totalPaidDays * perDayRate;
      const netSalary = earnings - (member.advance || 0);

      // Check if already settled
      const settlement = settlements.find(s => s.staffId === member.id);

      totalBaseSalary += member.salary;
      // totalDeductions is now what WASN'T earned + advance
      const potentialSalary = member.salary;
      const missedEarnings = potentialSalary - earnings;
      totalDeductions += missedEarnings;
      totalAdvances += (member.advance || 0);

      return {
        ...member._doc,
        presentDays: presentCount,
        paidLeaves,
        totalPaidDays,
        uninformedCuts: uninformedCount,
        earnings,
        netSalary,
        isSettled: !!settlement,
        settlementDetails: settlement || null
      };
    });

    res.json({
      month,
      year,
      totalStaff: staffList.length,
      totalBaseSalary,
      totalDeductions,
      totalAdvances,
      netPayroll: totalBaseSalary - totalDeductions - totalAdvances,
      staff: staffWithCalculations
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET monthly attendance report (Partitioned)
exports.getStaffMonthlyAttendance = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { id } = req.params;
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const logs = await Attendance.find({ partnerId, staffId_ref: id, month, year }).sort({ date: 1 });
    // Note: If frontend sends staff's MongoDB _id, let's also support searching by that.
    // However, for consistency, if req.params.id is an ObjectID, we look up the staff first.
    let searchId = id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const s = await Staff.findById(id);
      if (s) searchId = s.id;
    }
    const logsReal = await Attendance.find({ partnerId, staffId: searchId, month, year }).sort({ date: 1 });
    res.json(logsReal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST process salary settlement (Partitioned)
exports.processSettlement = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { id } = req.params;
    const { amount, month, year, paymentMethod, absences, deduction, transactionId } = req.body;

    // Resolve staffId if necessary
    let searchId = id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const s = await Staff.findById(id);
      if (s) searchId = s.id;
    }

    // Check for duplicate (enforcing partition)
    const existing = await Settlement.findOne({ partnerId, staffId: searchId, month, year });
    if (existing) return res.status(400).json({ message: 'Salary already settled for this month' });

    // Validate online payment has UTR
    if (paymentMethod === 'Online' && !transactionId) {
      return res.status(400).json({ message: 'Transaction ID (UTR) is required for online payments' });
    }

    // Generate Unique Settlement ID
    const settlementId = `SET-${partnerId.split('-')[0].toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const settlement = new Settlement({
      id: settlementId,
      partnerId,
      type: 'Salary',
      staffId: searchId,
      amount,
      month,
      year,
      paymentMethod,
      absencesRef: absences,
      deductionRef: deduction,
      transactionId: transactionId || ''
    });


    await settlement.save();
    res.status(201).json(settlement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET settlement history (Partitioned)
exports.getSettlements = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { month, year } = req.query;
    const filter = { partnerId };
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    
    const data = await Settlement.find(filter).sort({ processedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
