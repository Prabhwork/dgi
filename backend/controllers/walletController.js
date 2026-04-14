const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sendPushNotification } = require('../services/pushNotificationService');
const sendEmail = require('../utils/sendEmail');
const { getWalletPinResetOTPTemplate } = require('../utils/emailTemplates');
const User = require('../models/User');

// Helper to get or create wallet
const getOrCreateWallet = async (userId) => {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
        wallet = await Wallet.create({ userId, balance: 0 });
    }
    return wallet;
};

// @desc    Get wallet balance and info
// @route   GET /api/wallet/balance
// @access  Private
exports.getWalletBalance = async (req, res) => {
    try {
        const wallet = await getOrCreateWallet(req.user.id);
        res.status(200).json({
            success: true,
            balance: wallet.balance,
            isPinSet: wallet.isPinSet,
            status: wallet.status
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Create Razorpay order for recharge
// @route   POST /api/wallet/recharge/order
// @access  Private
exports.createRechargeOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Please provide a valid amount' });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `recharge_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        const wallet = await getOrCreateWallet(req.user.id);

        // Create a pending transaction
        await WalletTransaction.create({
            walletId: wallet._id,
            userId: req.user.id,
            amount: amount,
            type: 'credit',
            description: 'Wallet Recharge - Razorpay',
            status: 'pending',
            razorpayOrderId: order.id
        });

        res.status(201).json({
            success: true,
            orderId: order.id,
            amount: amount,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify recharge payment
// @route   POST /api/wallet/recharge/verify
// @access  Private
exports.verifyRecharge = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpaySignature;

        if (isAuthentic) {
            // Update transaction and wallet balance
            const transaction = await WalletTransaction.findOne({ razorpayOrderId });
            if (!transaction) {
                return res.status(404).json({ success: false, error: 'Transaction not found' });
            }

            if (transaction.status === 'success') {
                return res.status(400).json({ success: false, error: 'Transaction already processed' });
            }

            transaction.status = 'success';
            transaction.razorpayPaymentId = razorpayPaymentId;
            await transaction.save();

            const wallet = await Wallet.findById(transaction.walletId);
            wallet.balance += transaction.amount;
            await wallet.save();

            // Send Push Notification
            await sendPushNotification(transaction.userId, {
                title: 'Wallet Recharged! 💰',
                body: `₹${transaction.amount.toFixed(2)} has been successfully added to your DBI Wallet. Your new balance is ₹${wallet.balance.toFixed(2)}.`,
                type: 'Payment',
                data: { type: 'WALLET_RECHARGE', balance: wallet.balance.toString() }
            });

            res.status(200).json({
                success: true,
                message: 'Payment verified and wallet credited',
                balance: wallet.balance
            });
        } else {
            res.status(400).json({ success: false, error: 'Payment verification failed' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Set or Update Wallet PIN
// @route   POST /api/wallet/pin
// @access  Private
exports.setWalletPin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!pin || pin.length < 4) {
            return res.status(400).json({ success: false, error: 'PIN must be at least 4 digits' });
        }

        const wallet = await getOrCreateWallet(req.user.id);
        
        const salt = await bcrypt.genSalt(10);
        wallet.pin = await bcrypt.hash(pin, salt);
        wallet.isPinSet = true;
        await wallet.save();

        res.status(200).json({
            success: true,
            message: 'Wallet PIN set successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Verify Wallet PIN
// @route   POST /api/wallet/pin/verify
// @access  Private
exports.verifyPin = async (req, res) => {
    try {
        const { pin } = req.body;
        const wallet = await Wallet.findOne({ userId: req.user.id }).select('+pin');

        if (!wallet || !wallet.isPinSet) {
            return res.status(400).json({ success: false, error: 'Wallet PIN not set' });
        }

        const isMatch = await bcrypt.compare(pin, wallet.pin);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Incorrect PIN' });
        }

        res.status(200).json({
            success: true,
            message: 'PIN verified'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Initiate "Forgot PIN" - Send OTP to email
// @route   POST /api/wallet/pin/forgot
// @access  Private
exports.forgotPin = async (req, res) => {
    try {
        const wallet = await getOrCreateWallet(req.user.id);
        const user = await User.findById(req.user.id);

        if (!user || !user.email) {
            return res.status(404).json({ success: false, error: 'User email not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Save encrypted OTP
        const salt = await bcrypt.genSalt(10);
        wallet.resetPinOTP = await bcrypt.hash(otp, salt);
        wallet.resetPinOTPExpire = otpExpire;
        await wallet.save();

        // Send Email
        await sendEmail({
            email: user.email,
            subject: 'Wallet PIN Reset OTP - DBI',
            html: getWalletPinResetOTPTemplate(user.fullname || 'User', otp)
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent to your registered email'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Reset PIN using OTP
// @route   POST /api/wallet/pin/reset
// @access  Private
exports.resetPin = async (req, res) => {
    try {
        const { otp, newPin } = req.body;

        if (!otp || !newPin || newPin.length < 4) {
            return res.status(400).json({ success: false, error: 'Invalid OTP or PIN' });
        }

        const wallet = await Wallet.findOne({ userId: req.user.id }).select('+resetPinOTP +resetPinOTPExpire');
        
        if (!wallet || !wallet.resetPinOTP || !wallet.resetPinOTPExpire) {
            return res.status(400).json({ success: false, error: 'OTP request not found or expired' });
        }

        // Check expiry
        if (Date.now() > wallet.resetPinOTPExpire) {
            return res.status(400).json({ success: false, error: 'OTP has expired' });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp.toString(), wallet.resetPinOTP);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid OTP' });
        }

        // Hash new PIN
        const salt = await bcrypt.genSalt(10);
        wallet.pin = await bcrypt.hash(newPin, salt);
        wallet.isPinSet = true;

        // Clear OTP fields
        wallet.resetPinOTP = undefined;
        wallet.resetPinOTPExpire = undefined;
        await wallet.save();

        res.status(200).json({
            success: true,
            message: 'Wallet PIN reset successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Process a wallet payment (Verify PIN and Debit)
// @route   POST /api/wallet/pay
// @access  Private
exports.processPayment = async (req, res) => {
    try {
        const { amount, pin, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid payment amount' });
        }

        if (!pin) {
            return res.status(400).json({ success: false, error: 'Wallet PIN is required' });
        }

        const wallet = await Wallet.findOne({ userId: req.user.id }).select('+pin');
        if (!wallet || !wallet.isPinSet) {
            return res.status(400).json({ success: false, error: 'Wallet PIN not set' });
        }

        // 1. Verify PIN
        const isMatch = await bcrypt.compare(pin, wallet.pin);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Incorrect PIN' });
        }

        // 2. Process Debit
        const newBalance = await exports.debitWallet(
            req.user.id,
            amount,
            description || 'Food Order Payment',
            `ORDER-${Date.now()}`
        );

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            balance: newBalance
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Debit wallet (called internally or via secure order route)
exports.debitWallet = async (userId, amount, description, referenceId) => {
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
    }

    wallet.balance -= amount;
    await wallet.save();

    await WalletTransaction.create({
        walletId: wallet._id,
        userId,
        amount,
        type: 'debit',
        description,
        status: 'success',
        referenceId
    });

    // Send Push Notification
    await sendPushNotification(userId, {
        title: 'Payment Successful 💸',
        body: `₹${amount.toFixed(2)} spent on ${description}. Remaining balance: ₹${wallet.balance.toFixed(2)}.`,
        type: 'Payment',
        data: { type: 'WALLET_DEBIT', balance: wallet.balance.toString(), referenceId: referenceId || '' }
    });

    return wallet.balance;
};

// @desc    Get wallet transactions
// @route   GET /api/wallet/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const wallet = await getOrCreateWallet(req.user.id);
        const transactions = await WalletTransaction.find({ walletId: wallet._id, status: 'success' })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
