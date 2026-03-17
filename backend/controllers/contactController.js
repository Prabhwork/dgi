const Contact = require('../models/Contact');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin)
exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      data: contacts
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};
