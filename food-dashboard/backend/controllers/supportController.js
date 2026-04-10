const mongoose = require('mongoose');
const fcmService = require('../services/fcmService');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || req.partnerId;

// ── Ticket Schema ─────────────────────────────────────────────────────────────
const ticketSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  partnerId: { type: String, required: true, index: true },
  customerName: { type: String, default: 'Staff Partner' },
  subject: { type: String, required: true },
  category: {
    type: String,
    enum: ['Payments & Settlements', 'Order Management', 'Profile & Account View', 'Technical Error/Bug', 'Order Logic Audit', 'Profile & Data View', 'Platform Bug / Error'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Normal Business Support', 'Critical (Live Order Impact)', 'CRITICAL (Live Impact)'],
    default: 'Normal Business Support',
  },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Solved', 'Closed'],
    default: 'Open',
  },
  date: { type: String },
  resolvedAt: { type: Date },
  relatedOrderId: { type: String },
  relatedTxnId: { type: String },
}, { timestamps: true });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

// ── FAQ Schema ────────────────────────────────────────────────────────────────
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, required: true },
  category: {
    type: String,
    enum: ['Orders', 'Payments', 'Profile', 'Technical'],
    required: true,
  },
  helpful: { type: Number, default: 0 },
  views:   { type: Number, default: 0 },
}, { timestamps: true });

const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);

// ─────────────────────────────────────────────────────────────────────────────
//  TICKET CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

// GET all tickets (Partitioned by Partner)
exports.getAllTickets = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const filter = { partnerId };
    if (req.query.status)   filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single ticket (enforcing partner isolation)
exports.getTicketById = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const ticket = await Ticket.findOne({ id: req.params.id, partnerId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found or access denied' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create new ticket (automatically assigning current partnerId)
exports.createTicket = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const count = await Ticket.countDocuments({ partnerId });
    const newId = `TKT-${partnerId.split('-')[0].toUpperCase()}-${990 + count + 1}`;
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const ticket = new Ticket({
      ...req.body,
      id: newId,
      partnerId,
      customerName: req.body.customerName || 'Staff Partner',
      date: req.body.date || today,
    });
    const saved = await ticket.save();

    // Trigger FCM Notification for New Ticket (to Main Admin)
    try {
        await fcmService.sendToTopic('dbi-admin-alerts', {
            title: '🛠️ New Support Ticket',
            body: `[${saved.id}] ${saved.subject} (${saved.priority})`,
            data: { ticketId: saved.id, type: 'NEW_TICKET' }
        });
    } catch (fcmErr) {
        console.error("FCM New Ticket Error:", fcmErr);
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update ticket status (enforcing partner isolation)
exports.updateTicketStatus = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const validStatuses = ['Open', 'In Progress', 'Solved', 'Closed'];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    const update = { status: req.body.status };
    if (req.body.status === 'Solved' || req.body.status === 'Closed') {
      update.resolvedAt = new Date();
    }
    const ticket = await Ticket.findOneAndUpdate(
      { id: req.params.id, partnerId },
      update,
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found or access denied' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET search tickets (Partitioned by Partner)
exports.searchTickets = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query required' });
    const regex = new RegExp(q.trim(), 'i');
    const tickets = await Ticket.find({
      partnerId,
      $or: [{ id: regex }, { subject: regex }, { category: regex }, { description: regex }]
    }).sort({ createdAt: -1 }).limit(10);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE ticket (multi-tenant protection)
exports.deleteTicket = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const result = await Ticket.findOneAndDelete({ id: req.params.id, partnerId });
    if (!result) return res.status(404).json({ message: 'Access denied or ticket not found' });
    res.json({ message: 'Ticket purged from partner records' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ticket stats (Partitioned by Partner)
exports.getTicketStats = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const open       = await Ticket.countDocuments({ partnerId, status: 'Open' });
    const inProgress = await Ticket.countDocuments({ partnerId, status: 'In Progress' });
    const solved     = await Ticket.countDocuments({ partnerId, status: 'Solved' });
    const closed     = await Ticket.countDocuments({ partnerId, status: 'Closed' });
    const total      = open + inProgress + solved + closed;
    res.json({ total, open, inProgress, solved, closed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  FAQ CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

exports.getAllFAQs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const faqs = await FAQ.find(filter).sort({ views: -1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchFAQs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });
    const regex = new RegExp(q.trim(), 'i');
    const faqs = await FAQ.find({
      $or: [{ question: regex }, { answer: regex }, { category: regex }]
    });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createFAQ = async (req, res) => {
  try {
    const faq = new FAQ({ ...req.body });
    const saved = await faq.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markFAQHelpful = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1, views: 1 } },
      { new: true }
    );
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    const result = await FAQ.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET combined support search (Partitioned by Partner)
exports.combinedSupportSearch = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });
    const regex = new RegExp(q.trim(), 'i');

    const [tickets, faqs] = await Promise.all([
      Ticket.find({
        partnerId,
        $or: [{ id: regex }, { subject: regex }, { category: regex }]
      }).limit(5),
      FAQ.find({
        $or: [{ question: regex }, { answer: regex }, { category: regex }]
      }).limit(5),
    ]);

    res.json({ tickets, faqs, totalResults: tickets.length + faqs.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
