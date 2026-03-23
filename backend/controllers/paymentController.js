const Razorpay = require('razorpay');

exports.createRegistrationOrder = async (req, res, next) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: 36500, // 365 INR in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        res.status(201).json({
            success: true,
            orderId: order.id,
            amount: 365,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('Order Creation Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
