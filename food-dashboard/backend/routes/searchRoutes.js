const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { protectPartner } = require('../middleware/auth');

router.use(protectPartner);

// GET global search (header search bar)
router.get('/', searchController.globalSearch);

module.exports = router;
