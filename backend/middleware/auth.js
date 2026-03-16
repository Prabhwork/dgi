const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Business = require('../models/Business');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try to find as Admin first
        let user = await Admin.findById(decoded.id);

        // If not admin, try to find as Business
        if (!user) {
            user = await Business.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }

        req.user = user;
        // Keep req.admin for backward compatibility if needed, but prefer req.user
        if (user.constructor.modelName === 'Admin') {
            req.admin = user;
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Since we attached user in protect, and we have req.admin or req.user
        // We'll check the model type or a role field if it exists.
        // For this system, admins are from 'Admin' model.

        const isRoleAuthorized = roles.some(role => {
            if (role === 'admin' && req.user.constructor.modelName === 'Admin') return true;
            if (role === 'business' && req.user.constructor.modelName === 'Business') return true;
            return false;
        });

        if (!isRoleAuthorized) {
            return res.status(403).json({
                success: false,
                error: `User role is not authorized to access this route`
            });
        }
        next();
    };
};
