const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protectPartner } = require('../middleware/auth');

router.use(protectPartner);

// GET full analytics dashboard data
router.get('/dashboard', analyticsController.getAnalyticsDashboard);

// GET monthly sales data (last 6 months)
router.get('/monthly-sales', analyticsController.getMonthlySales);

// GET category performance (best categories by order count)
router.get('/category-performance', analyticsController.getCategoryPerformance);

// GET KPI metrics for analytics page
router.get('/kpis', analyticsController.getKPIs);

// GET trending products
router.get('/trending-products', analyticsController.getTrendingProducts);

module.exports = router;
