const express = require('express');
const {
  getExistingCustomers,
  getExistingCustomer,
  createExistingCustomer,
  updateExistingCustomer,
  deleteExistingCustomer
} = require('../controllers/existingCustomers');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router
  .route('/')
  .get(getExistingCustomers)
  .post(protect, authorize('admin'), upload.single('logo'), createExistingCustomer);

router
  .route('/:id')
  .get(getExistingCustomer)
  .put(protect, authorize('admin'), upload.single('logo'), updateExistingCustomer)
  .delete(protect, authorize('admin'), deleteExistingCustomer);

module.exports = router;
