const ExistingCustomer = require('../models/ExistingCustomer');
const path = require('path');
const fs = require('fs');

// @desc    Get all existing customers
// @route   GET /api/existing-customers
// @access  Public (Active) / Private (All admin viewing)
exports.getExistingCustomers = async (req, res) => {
  try {
    const query = req.query.all === 'true' ? {} : { isActive: true };
    const customers = await ExistingCustomer.find(query).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single existing customer
// @route   GET /api/existing-customers/:id
// @access  Public
exports.getExistingCustomer = async (req, res) => {
  try {
    const customer = await ExistingCustomer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new existing customer
// @route   POST /api/existing-customers
// @access  Private
exports.createExistingCustomer = async (req, res) => {
  try {
    if (req.file) {
      req.body.logo = req.file.filename;
    }
    const customer = await ExistingCustomer.create(req.body);

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update existing customer
// @route   PUT /api/existing-customers/:id
// @access  Private
exports.updateExistingCustomer = async (req, res) => {
  try {
    let customer = await ExistingCustomer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    if (req.file) {
      // Delete old logo
      if (customer.logo && customer.logo !== 'no-photo.jpg') {
        const oldPath = path.join(__dirname, '../uploads/', customer.logo);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      req.body.logo = req.file.filename;
    }

    customer = await ExistingCustomer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete existing customer
// @route   DELETE /api/existing-customers/:id
// @access  Private
exports.deleteExistingCustomer = async (req, res) => {
  try {
    const customer = await ExistingCustomer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Delete logo
    if (customer.logo && customer.logo !== 'no-photo.jpg') {
        const imagePath = path.join(__dirname, '../uploads/', customer.logo);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
