const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Staff = require('../models/Staff');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || '69b93a0452f3d2ba12cb2d27';

// GET full analytics dashboard data (Partitioned by Partner)
exports.getAnalyticsDashboard = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    
    // Total orders & revenue
    const totalOrders = await Order.countDocuments({ partnerId });
    const pendingOrders = await Order.countDocuments({ 
      partnerId, 
      status: { $in: ['Pending', 'Accepted', 'Preparing', 'Ready'] } 
    });
    const completedOrders = await Order.countDocuments({ partnerId, status: 'Completed' });

    const revenueAgg = await Order.aggregate([
      { $match: { partnerId, payment: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Review summary
    const reviews = await Review.find({ partnerId });
    const avgRating = reviews.length
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    // Staff summary
    const totalStaff = await Staff.countDocuments({ partnerId });
    const presentStaff = await Staff.countDocuments({ partnerId, status: 'Present' });

    res.json({
      stats: [
        { label: 'Total Orders', value: String(totalOrders), sub: `+12% from yesterday`, icon: 'orders', color: 'primary' },
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, sub: '+8% from yesterday', icon: 'revenue', color: 'emerald' },
        { label: 'Pending Orders', value: String(pendingOrders).padStart(2, '0'), sub: 'Needs attention', icon: 'pending', color: 'amber' },
        { label: 'Completed', value: String(completedOrders), sub: 'Successfully delivered', icon: 'completed', color: 'blue' },
      ],
      avgRating: Number(avgRating),
      totalReviews: reviews.length,
      totalStaff,
      presentStaff,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET monthly sales data (last 6 months)
// GET monthly sales data (last 6 months, Partitioned by Partner)
exports.getMonthlySales = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const monthsLimit = parseInt(req.query.limit) || 6;
    const months = [];
    for (let i = monthsLimit - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthName = date.toLocaleString('en-IN', { month: 'short' });

      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);

      const agg = await Order.aggregate([
        { $match: { partnerId, createdAt: { $gte: start, $lte: end }, payment: 'Paid' } },
        { $group: { _id: null, revenue: { $sum: '$total' }, orders: { $sum: 1 } } }
      ]);

      months.push({
        month: monthName,
        revenue: agg[0]?.revenue || 0,
        orders: agg[0]?.orders || 0,
      });
    }
    res.json(months);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET category performance (best categories by order count)
// GET category performance (Partitioned by Partner)
exports.getCategoryPerformance = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const products = await Product.find({ partnerId });
    const orders = await Order.find({ partnerId, status: 'Completed' });

    // Build category order counts by checking items strings
    const categoryCount = {};
    products.forEach(p => {
      if (!categoryCount[p.category]) categoryCount[p.category] = 0;
    });

    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          // Find product category by name or ID match
          const product = products.find(p => p.name === item.name || p._id.toString() === item.menuItem?.toString());
          if (product) {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
          }
        });
      }
    });

    const totalOrders = Object.values(categoryCount).reduce((a, b) => a + b, 0) || 1;
    const result = Object.entries(categoryCount)
      .map(([name, count]) => ({
        name,
        count: `${count} Orders`,
        percentage: Math.round((count / totalOrders) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET KPI metrics for analytics page
// GET KPI metrics (Partitioned by Partner)
exports.getKPIs = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const paidOrders = await Order.find({ partnerId, payment: 'Paid' });
    const totalRevenue = paidOrders.reduce((a, o) => a + o.total, 0);
    const avgOrderValue = paidOrders.length ? (totalRevenue / paidOrders.length).toFixed(2) : 0;

    const completedCount = await Order.countDocuments({ partnerId, status: 'Completed' });
    const totalOrders = await Order.countDocuments({ partnerId });
    const successRate = totalOrders ? (completedCount / totalOrders * 100).toFixed(1) : 0;

    res.json({
      avgOrderValue: `₹${avgOrderValue}`,
      canceledOrdersPercent: `${(100 - successRate).toFixed(1)}%`,
      prepEfficiency: '12.4m',
      customerRetention: '64%',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET top trending products (Partitioned by Partner)
exports.getTrendingProducts = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const orders = await Order.find({ partnerId, status: 'Completed' });
    
    // Simple parser: "1x Margherita Pizza" -> "Margherita Pizza"
    const productCounts = {};
    orders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(item => {
          const name = item.name;
          if (name) {
            productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1);
          }
        });
      }
    });

    const trending = Object.entries(productCounts)
        .map(([name, orders]) => ({
            name,
            orders,
            growth: `+${Math.floor(Math.random() * 20) + 5}%` 
        }))
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 3);

    res.json(trending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
