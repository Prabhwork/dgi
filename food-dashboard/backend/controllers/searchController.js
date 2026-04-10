const Order = require('../models/Order');
const Product = require('../models/Product');
const Staff = require('../models/Staff');
const Category = require('../models/Category');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || '69b93a0452f3d2ba12cb2d27';

// GET global search (header search bar, Partitioned by Partner)
exports.globalSearch = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query required' });

    const regex = new RegExp(q.trim(), 'i');

    const [orders, products, staff, categories] = await Promise.all([
      Order.find({ 
        partnerId, 
        $or: [{ id: regex }, { customer: regex }, { items: regex }] 
      }).limit(5),
      Product.find({ 
        partnerId, 
        $or: [{ name: regex }, { category: regex }] 
      }).limit(5),
      Staff.find({ 
        partnerId, 
        $or: [{ name: regex }, { role: regex }, { id: regex }] 
      }).limit(5),
      Category.find({ partnerId, name: regex }).limit(5),
    ]);

    const results = [
      ...orders.map(o => ({ ...o.toObject(), type: 'Order', link: `/orders/${o.id}` })),
      ...products.map(p => ({ ...p.toObject(), type: 'Product', link: '/menu' })),
      ...staff.map(s => ({ ...s.toObject(), type: 'Staff', link: '/team' })),
      ...categories.map(c => ({ ...c.toObject(), type: 'Category', link: '/menu' })),
    ];

    res.json({
      results,
      totalResults: results.length,
      query: q,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
