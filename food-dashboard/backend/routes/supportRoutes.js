const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { protectPartner } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
//  TICKET ROUTES (Authenticated)
// ─────────────────────────────────────────────────────────────────────────────
router.use('/tickets', protectPartner);

// GET all tickets
router.get('/tickets', supportController.getAllTickets);

// GET single ticket
router.get('/tickets/:id', supportController.getTicketById);

// POST create new ticket
router.post('/tickets', supportController.createTicket);

// PUT update ticket status
router.put('/tickets/:id/status', supportController.updateTicketStatus);

// GET search tickets
router.get('/tickets/search', supportController.searchTickets);

// DELETE ticket
router.delete('/tickets/:id', supportController.deleteTicket);

// GET ticket activity summary
router.get('/tickets/meta/stats', supportController.getTicketStats);


// ─────────────────────────────────────────────────────────────────────────────
//  FAQ ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET all FAQs
router.get('/faqs', supportController.getAllFAQs);

// GET search FAQs
router.get('/faqs/search', supportController.searchFAQs);

// POST add new FAQ
router.post('/faqs', supportController.createFAQ);

// PUT mark FAQ as helpful
router.put('/faqs/:id/helpful', supportController.markFAQHelpful);

// DELETE FAQ
router.delete('/faqs/:id', supportController.deleteFAQ);


// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL SUPPORT SEARCH
// ─────────────────────────────────────────────────────────────────────────────
router.get('/search', supportController.combinedSupportSearch);

module.exports = router;
