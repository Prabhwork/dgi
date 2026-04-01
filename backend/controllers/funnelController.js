const FunnelQuestion = require('../models/FunnelQuestion');
const FunnelLead = require('../models/FunnelLead');

// @desc    Get all active questions
// @route   GET /api/funnel/questions
// @access  Public
exports.getQuestions = async (req, res) => {
  try {
    const questions = await FunnelQuestion.find({ isActive: true }).sort('order');
    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new question
// @route   POST /api/funnel/questions
// @access  Private (Admin)
exports.createQuestion = async (req, res) => {
  try {
    const question = await FunnelQuestion.create(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update a question
// @route   PUT /api/funnel/questions/:id
// @access  Private (Admin)
exports.updateQuestion = async (req, res) => {
  try {
    const question = await FunnelQuestion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    res.status(200).json({ success: true, data: question });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/funnel/questions/:id
// @access  Private (Admin)
exports.deleteQuestion = async (req, res) => {
  try {
    await FunnelQuestion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Submit a lead
// @route   POST /api/funnel/leads
// @access  Public
exports.submitLead = async (req, res) => {
  try {
    const lead = await FunnelLead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all leads
// @route   GET /api/funnel/leads
// @access  Private (Admin)
exports.getLeads = async (req, res) => {
  try {
    const leads = await FunnelLead.find().sort('-createdAt');
    res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
