const GlobalSettings = require('../models/GlobalSettings');

// @desc    Get all global settings
// @route   GET /api/global-settings
// @access  Public
exports.getGlobalSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = await GlobalSettings.create({});
        }
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Update global settings
// @route   PUT /api/global-settings
// @access  Private/Admin
exports.updateGlobalSettings = async (req, res) => {
    try {
        let settings = await GlobalSettings.findOne();
        if (!settings) {
            settings = await GlobalSettings.create(req.body);
        } else {
            settings = await GlobalSettings.findOneAndUpdate({}, req.body, {
                new: true,
                runValidators: true
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
};

// @desc    Get current live listing count
// @route   GET /api/global-settings/live-listing
// @access  Public
exports.getLiveListingCount = async (req, res) => {
    try {
        const settings = await GlobalSettings.findOne().select('liveListingCurrent');
        if (!settings) {
            return res.status(200).json({
                success: true,
                count: 3842
            });
        }
        res.status(200).json({
            success: true,
            count: settings.liveListingCurrent
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};
