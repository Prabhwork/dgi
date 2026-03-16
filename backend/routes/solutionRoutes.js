const express = require('express');
const {
    getSolutions,
    getSolution,
    createSolution,
    updateSolution,
    deleteSolution
} = require('../controllers/solutionController');

const router = express.Router({ mergeParams: true });

const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Solution = require('../models/Solution');

// Public routes
router
    .route('/')
    .get(advancedResults(Solution, { path: 'category', select: 'name description icon' }), getSolutions);

router
    .route('/:id')
    .get(getSolution);

// Protected routes
router.use(protect);

router
    .route('/')
    .post(createSolution);

router
    .route('/:id')
    .put(updateSolution)
    .delete(deleteSolution);

module.exports = router;
