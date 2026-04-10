const jwt = require('jsonwebtoken');
const Partner = require('../models/Partner');
const mainDb = require('../config/mainDb');
const { isFoodRelated } = require('../utils/categoryCheck');

// Protect Admin Routes
const protectAdmin = async (req, res, next) => {
    let token = getBearerToken(req);

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try {
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret7721');
        } catch (e) {
            // If local secret fails, try the Digital Book Of India main admin secret
            decoded = jwt.verify(token, process.env.MAIN_JWT_SECRET);
        }

        if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        
        req.adminId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

// SSO Support: Protect Partner Routes (Dual-Secret Auth)
const protectPartner = async (req, res, next) => {
    let token = getBearerToken(req);

    if (!token) {
        return res.status(401).json({ success: false, message: 'Partner Token Required' });
    }

    try {
        // 1. Try Local Secret (Standard Food Dashboard Login)
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret7721');
            req.partnerId = decoded.id;
            return next();
        } catch (e) {
            // Not a local token — try SSO path below
        }

        // 2. Try Main Site Secret (SSO Login from DBI)
        try {
            decoded = jwt.verify(token, process.env.MAIN_JWT_SECRET);
        } catch (e) {
            console.error('[Auth] Token invalid (both secrets failed):', e.message);
            return res.status(401).json({ success: false, message: 'Invalid Authentication Token' });
        }

        // 3. Verify this business exists in the DBI main database
        let mainBusiness;
        try {
            mainBusiness = await mainDb.collection('businesses').findOne({
                _id: new (require('mongoose').Types.ObjectId)(decoded.id)
            });
        } catch (e) {
            console.error('[Auth] Main DB lookup error:', e.message);
            return res.status(503).json({ success: false, message: 'SSO Service Unavailable' });
        }

        if (!mainBusiness) {
            console.error('[Auth] SSO business not found. decoded.id =', decoded.id);
            return res.status(403).json({ success: false, message: 'SSO Error: Business not found in DBI' });
        }

        if (!isFoodRelated(mainBusiness.businessCategory)) {
            console.error('[Auth] Business is not food-related:', mainBusiness.businessCategory);
            return res.status(403).json({ success: false, message: 'SSO Error: Business is not a Restaurant account' });
        }

        // 4. Sync: Ensure a Partner record exists in Food Dashboard DB
        //    Use upsert-style logic to handle race conditions safely
        let partner = await Partner.findOne({ id: decoded.id });

        if (!partner) {
            try {
                partner = await Partner.create({
                    id:           decoded.id,
                    businessName: mainBusiness.businessName || mainBusiness.brandName || 'DGI Partner',
                    ownerName:    mainBusiness.ownerName || mainBusiness.registeredName || 'Partner',
                    email:        mainBusiness.officialEmailAddress || mainBusiness.email || '',
                    phone:        mainBusiness.primaryContactNumber || mainBusiness.phone || '',
                    category:     mainBusiness.businessCategory || 'Restaurant',
                    status:       'Active'
                });
                console.log('[Auth] New SSO partner synced:', partner.id);
            } catch (createErr) {
                // E11000: another request created it first — fetch the existing record
                if (createErr.code === 11000) {
                    partner = await Partner.findOne({ id: decoded.id });
                    if (!partner) {
                        console.error('[Auth] E11000 but partner still not found:', createErr.message);
                        return res.status(500).json({ success: false, message: 'Partner sync error' });
                    }
                    console.log('[Auth] Partner already exists (race condition resolved):', partner.id);
                } else {
                    console.error('[Auth] Partner create failed:', createErr.message);
                    return res.status(500).json({ success: false, message: 'Partner sync failed' });
                }
            }
        }

        // Attach partner id for downstream controllers
        req.partnerId = partner.id;
        req.headers['x-partner-id'] = partner.id;
        return next();

    } catch (error) {
        console.error('[Auth] Unexpected SSO Auth Error:', error.message);
        return res.status(401).json({ success: false, message: 'Authentication Failed' });
    }
};

const getBearerToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};

module.exports = { protectAdmin, protectPartner };

