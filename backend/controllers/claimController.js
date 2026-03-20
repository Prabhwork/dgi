const Claim = require('../models/Claim');
const Business = require('../models/Business');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const {
    getClaimApprovedClaimerTemplate,
    getClaimRejectedClaimerTemplate,
    getClaimApprovedOwnerAlertTemplate,
    getClaimRejectedOwnerAlertTemplate
} = require('../utils/emailTemplates');

// @desc    Submit a business claim
// @route   POST /api/business/claim/:id
// @access  Public
exports.submitClaim = async (req, res, next) => {
    try {
        const businessId = req.params.id;
        const { fullName, phoneNumber, email } = req.body;

        if (!req.files || !req.files.ownerProof) {
            return res.status(400).json({ success: false, error: 'Please upload owner proof' });
        }

        const ownerProof = req.files.ownerProof[0].path.replace(/\\/g, '/');

        const claim = await Claim.create({
            businessId,
            fullName,
            phoneNumber,
            email,
            ownerProof
        });

        res.status(201).json({
            success: true,
            data: claim,
            message: 'Claim submitted successfully. Admin will review it shortly.'
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all claims
// @route   GET /api/business/claims
// @access  Private/Admin
exports.getClaims = async (req, res, next) => {
    try {
        const claims = await Claim.find().populate('businessId', 'businessName brandName');
        res.status(200).json({ success: true, data: claims });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update claim status (Approve/Reject)
// @route   PUT /api/business/claims/:id
// @access  Private/Admin
exports.updateClaimStatus = async (req, res, next) => {
    try {
        const { status, adminNotes } = req.body;
        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({ success: false, error: 'Claim not found' });
        }

        // Get the business associated with this claim
        const business = await Business.findById(claim.businessId);
        if (!business) {
            return res.status(404).json({ success: false, error: 'Business not found' });
        }

        const originalOwnerEmail = business.officialEmailAddress;
        const businessName = business.businessName;

        if (status === 'approved') {
            // ── 1. Disable the original business account (lock it out) ──────────
            business.isActive = false;

            // ── 2. Update business contact details with claimer's info ───────────
            business.officialEmailAddress = claim.email;
            business.primaryContactNumber = claim.phoneNumber;

            // ── 3. Generate a secure one-time reset token ────────────────────────
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            business.passwordResetToken = hashedToken;
            business.passwordResetExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

            await business.save({ validateBeforeSave: false });

            // Build reset link pointing to frontend
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
            const resetLink = `${frontendUrl}/community/reset-password/${rawToken}`;

            // ── 4. Email → Claimer: Ownership approved + reset password link ─────
            try {
                await sendEmail({
                    email: claim.email,
                    subject: '🎉 Ownership Confirmed — Reset Your Password to Access Your Business | DBI',
                    html: getClaimApprovedClaimerTemplate(claim.fullName, businessName, resetLink)
                });
            } catch (emailErr) {
                console.error('Failed to send claimer approve email:', emailErr.message);
            }

            // ── 5. Email → Original Owner: Their business was transferred ────────
            try {
                await sendEmail({
                    email: originalOwnerEmail,
                    subject: '⚠️ Business Ownership Transferred — Official DBI Notice',
                    html: getClaimApprovedOwnerAlertTemplate(businessName, claim.fullName)
                });
            } catch (emailErr) {
                console.error('Failed to send original owner transfer email:', emailErr.message);
            }

        } else if (status === 'rejected') {
            const rejectionReason = adminNotes || 'The submitted documentation did not meet our verification standards.';

            // ── 1. Email → Claimer: Claim rejected ───────────────────────────────
            try {
                await sendEmail({
                    email: claim.email,
                    subject: '🚫 Your Ownership Claim Was Rejected | DBI',
                    html: getClaimRejectedClaimerTemplate(claim.fullName, businessName, rejectionReason)
                });
            } catch (emailErr) {
                console.error('Failed to send claimer reject email:', emailErr.message);
            }

            // ── 2. Email → Original Owner: Claim attempt rejected (you're safe) ──
            try {
                await sendEmail({
                    email: originalOwnerEmail,
                    subject: '🛡️ Claim Attempt on Your Business Was Rejected | DBI',
                    html: getClaimRejectedOwnerAlertTemplate(businessName, claim.fullName)
                });
            } catch (emailErr) {
                console.error('Failed to send original owner reject alert email:', emailErr.message);
            }
        }

        // ── Save the claim status ────────────────────────────────────────────────
        claim.status = status;
        claim.adminNotes = adminNotes;
        await claim.save();

        res.status(200).json({
            success: true,
            data: claim,
            message: `Claim ${status} successfully. Notification emails have been dispatched.`
        });
    } catch (err) {
        console.error('updateClaimStatus error:', err);
        res.status(400).json({ success: false, error: err.message });
    }
};
