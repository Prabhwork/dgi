const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const sendEmail = require('../utils/sendEmail');
const fcmService = require('../services/fcmService');
const FcmToken = require('../models/FcmToken');

// Helper to extract partnerId from headers with fallback
const getPartnerId = (req) => req.headers['x-partner-id'] || '69b93a0452f3d2ba12cb2d27';

// GET all orders (with status and multi-tenant partitioning)
exports.getAllOrders = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const filter = { partnerId };
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single order by custom id (enforcing partner isolation)
exports.getOrderById = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const order = await Order.findOne({ id: req.params.id, partnerId });
    if (!order) return res.status(404).json({ message: 'Order not found or access denied' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create new order (automatically assigning current partnerId)
exports.createOrder = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const itemsArray = req.body.itemsArray || [];
    const maxPrepTime = itemsArray.reduce((max, item) => Math.max(max, item.prepTime || 0), 0);
    
    const count = await Order.countDocuments({ partnerId });
    const newId = `ORD-${partnerId.split('-')[0].toUpperCase()}-${1000 + count + 1}`;
    
    const userId = req.body.userId || null;

    // ── Guard: Check for unreviewed completed orders ────────────────────────────
    if (userId) {
        const completedOrders = await Order.find({ userId, status: 'Completed' });
        if (completedOrders.length > 0) {
            const Review = require('../models/Review');
            const reviews = await Review.find({ orderId: { $in: completedOrders.map(o => o.id) } });
            const reviewedOrderIds = new Set(reviews.map(r => r.orderId));
            
            const unreviewed = completedOrders.find(o => !reviewedOrderIds.has(o.id));
            if (unreviewed) {
                return res.status(403).json({ 
                    message: 'PLEASE_REVIEW_PREVIOUS_ORDER', 
                    orderId: unreviewed.id 
                });
            }
        }
    }

    const order = new Order({ 
      ...req.body, 
      id: newId, 
      partnerId,
      userId,
      prepTime: maxPrepTime || 15 // Fallback to 15 mins if not provided
    });
    const saved = await order.save();

    // Automatically create a Transaction record for Paid orders (Real-time Wallet sync)
    if (saved.payment === 'Paid') {
      try {
        const txnId = `TXN-${saved.partnerId.split('-')[0].toUpperCase()}-${Date.now().toString().slice(-6)}`;
        await Transaction.create({
          id: txnId,
          partnerId,
          orderId: saved.id,
          amount: saved.total,
          status: 'Paid',
          method: saved.paymentMethod || 'Online',
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          gatewayRef: saved.razorpayPaymentId || 'INTERNAL'
        });
      } catch (txnErr) {
        console.error("Failed to log transaction for order:", saved.id, txnErr);
        // We don't fail the order just because the ledger entry failed, but we log it
      }
    }

    // Trigger Order Confirmation Email
    if (saved.customerEmail) {
      try {
        await sendEmail({
          email: saved.customerEmail,
          subject: `Order Confirmed: ${saved.id} - Digital Book of India`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
              <h2 style="color: #10B981; text-align: center;">Order Confirmed!</h2>
              <p>Hi <strong>${saved.customer}</strong>,</p>
              <p>Thank you for your order! We have successfully received it and the restaurant is currently preparing it.</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #555;">Order ID</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${saved.id}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #555;">Total Amount</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">₹${saved.total.toFixed(2)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #555;">Payment Mode</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${saved.paymentMethod || 'Cash on Delivery'}</td>
                </tr>
              </table>
              <p style="margin-top: 25px; text-align: center; color: #777; font-size: 12px;">Powered by Digital Book of India</p>
            </div>
          `
        });
      } catch (err) {
        console.error("Confirmation Email Error:", err);
      }
    }

    // Trigger FCM Notification for New Order (to Admin/Partner)
    try {
      await fcmService.sendToTopic(`food-admin-${partnerId}`, {
        title: '🆕 New Order Received!',
        body: `${saved.customer} placed a ${saved.orderType || 'Order'} for ₹${saved.total.toFixed(0)}`,
        partnerId: partnerId,
        userId: userId,
        data: { orderId: saved.id, type: 'NEW_ORDER' }
      });
    } catch (fcmErr) {
      console.error("FCM New Order Error:", fcmErr);
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update order status (enforcing partner isolation)
exports.updateOrderStatus = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const statusFlow = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];
    const order = await Order.findOne({ id: req.params.id, partnerId });
    if (!order) return res.status(404).json({ message: 'Order logic violation or access denied' });

    // If specific status is provided use it, else advance
    const newStatus = req.body.status || (() => {
      const currentIndex = statusFlow.indexOf(order.status);
      const nextIndex = Math.min(currentIndex + 1, statusFlow.length - 1);
      return statusFlow[nextIndex];
    })();

    order.status = newStatus;
    if (newStatus === 'Accepted') {
      order.acceptedAt = new Date();
      if (req.body.prepTime) {
        order.prepTime = Number(req.body.prepTime);
      }
    }
    if (newStatus === 'Preparing') {
      order.preparingAt = new Date();
      // Per user request, default prep time is 20 mins when starting preparation
      order.prepTime = order.prepTime || 20; 
    }
    if (newStatus === 'Ready') {
      order.readyAt = new Date();
    }
    const saved = await order.save();

    // Trigger FCM Notification for Status Change (to Customer)
    if (saved.userId) {
      try {
        const userTokens = await mainDb.collection('fcmtokens').find({ userId: new mongoose.Types.ObjectId(saved.userId) }).toArray();
        if (userTokens.length > 0) {
          const tokens = userTokens.map(t => t.token);
          const statusMessages = {
            'Accepted': 'Your order has been accepted and is joining the queue! 👨‍🍳',
            'Preparing': `The chef has started preparing your meal! 🥘 (Est: ${saved.prepTime} mins)`,
            'Ready': 'Your order is ready for pickup! 🗳️ Enjoy your meal!',
            'Completed': 'Order handed over successfully. Hope you enjoy it! ❤️'
          };
          
          if (statusMessages[newStatus]) {
            await fcmService.sendMulticast(tokens, {
              title: `Order ${newStatus}`,
              body: statusMessages[newStatus],
              partnerId: partnerId,
              userId: saved.userId,
              data: { orderId: saved.id, status: newStatus }
            });
          }
        }
      } catch (fcmErr) {
        console.error("FCM Status Update Error:", fcmErr);
      }
    }

    // Trigger FCM for Partner (Dashboard Update)
    try {
      await fcmService.sendToTopic(`food-partner-${partnerId}`, {
        title: `Order Updated: ${newStatus}`,
        body: `Order #${saved.id} is now ${newStatus}`,
        partnerId: partnerId,
        userId: saved.userId,
        data: { orderId: saved.id, status: newStatus }
      });
    } catch (fcmErr) {
      console.error("FCM Partner Sync Error:", fcmErr);
    }

    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE order (multi-tenant protection)
exports.deleteOrder = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const result = await Order.findOneAndDelete({ id: req.params.id, partnerId });
    if (!result) return res.status(404).json({ message: 'Access denied or order not found' });
    res.json({ message: 'Order purged from partner records', order: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET dashboard stats (Partitioned by Partner)
exports.getOrderStats = async (req, res) => {
  try {
    const partnerId = getPartnerId(req);
    const total = await Order.countDocuments({ partnerId });
    const pending = await Order.countDocuments({ partnerId, status: { $in: ['Pending', 'Accepted', 'Preparing', 'Ready'] } });
    const completed = await Order.countDocuments({ partnerId, status: 'Completed' });
    
    const revenueAgg = await Order.aggregate([
      { $match: { partnerId, payment: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const revenue = revenueAgg[0]?.total || 0;

    res.json({
      totalOrders: total,
      pendingOrders: pending,
      completedOrders: completed,
      totalRevenue: revenue,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// GET orders for a specific user by userId (Public - User facing)
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    
    // 1. Fetch orders
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).limit(50);
    
    // 2. Fetch Store Settings for each unique partner
    const uniquePartnerIds = [...new Set(orders.map(o => o.partnerId))];
    const Settings = require('../models/Settings'); // Dynamic require to avoid circularity
    const settingsList = await Settings.find({ partnerId: { $in: uniquePartnerIds } });
    
    const settingsMap = settingsList.reduce((acc, s) => {
      acc[s.partnerId] = { 
        storeName: s.businessName || 'DGI Partner', 
        storeAddress: s.address || '' 
      };
      return acc;
    }, {});

    // 3. Fetch reviews for these orders
    const Review = require('../models/Review');
    const reviews = await Review.find({ orderId: { $in: orders.map(o => o.id) } });
    const reviewsMap = reviews.reduce((acc, r) => {
      acc[r.orderId] = r.toObject();
      return acc;
    }, {});

    // 4. Attach store info and full review object to orders
    const enrichedOrders = orders.map(order => {
      const obj = order.toObject();
      const storeInfo = settingsMap[order.partnerId] || { storeName: 'Restaurant', storeAddress: '' };
      return { 
        ...obj, 
        ...storeInfo,
        isReviewed: !!reviewsMap[order.id],
        review: reviewsMap[order.id] || null
      };
    });

    res.json(enrichedOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
