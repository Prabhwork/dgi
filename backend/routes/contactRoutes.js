const express = require('express');
const {
  submitContact,
  getContacts,
  deleteContact
} = require('../controllers/contactController');

const router = express.Router();

router.post('/', submitContact);
router.get('/', getContacts);
router.delete('/:id', deleteContact);

module.exports = router;
