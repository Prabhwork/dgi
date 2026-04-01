const express = require('express');
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  submitLead,
  getLeads
} = require('../controllers/funnelController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router
  .route('/questions')
  .get(getQuestions)
  .post(protect, authorize('admin', 'employee'), createQuestion);

router
  .route('/questions/:id')
  .put(protect, authorize('admin', 'employee'), updateQuestion)
  .delete(protect, authorize('admin', 'employee'), deleteQuestion);

router
  .route('/leads')
  .get(protect, authorize('admin', 'employee'), getLeads)
  .post(submitLead);

module.exports = router;
