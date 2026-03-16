const PageDetail = require('../models/PageDetail');
const path = require('path');
const fs = require('fs');

// @desc    Get all page details
// @route   GET /api/page-details
// @access  Private/Admin
exports.getPageDetails = async (req, res) => {
    try {
        const pageDetails = await PageDetail.find()
            .populate('category', 'name')
            .populate('subcategory', 'name');

        res.status(200).json({
            success: true,
            count: pageDetails.length,
            data: pageDetails
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get single page detail
// @route   GET /api/page-details/:id
// @access  Public
exports.getPageDetail = async (req, res) => {
    try {
        const pageDetail = await PageDetail.findById(req.params.id)
            .populate('category', 'name')
            .populate('subcategory', 'name');

        if (!pageDetail) {
            return res.status(404).json({ success: false, error: 'Page detail not found' });
        }

        res.status(200).json({
            success: true,
            data: pageDetail
        });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create new page detail
// @route   POST /api/page-details
// @access  Private/Admin
exports.createPageDetail = async (req, res) => {
    try {
        if (req.file) {
            req.body.image = req.file.filename;
        }

        const pageDetail = await PageDetail.create(req.body);
        res.status(201).json({ success: true, data: pageDetail });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update page detail
// @route   PUT /api/page-details/:id
// @access  Private/Admin
exports.updatePageDetail = async (req, res) => {
    try {
        let pageDetail = await PageDetail.findById(req.params.id);

        if (!pageDetail) {
            return res.status(404).json({ success: false, error: 'Page detail not found' });
        }

        if (req.file) {
            // Delete old image
            if (pageDetail.image && pageDetail.image !== 'no-photo.jpg') {
                const oldPath = path.join(__dirname, '../uploads/', pageDetail.image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            req.body.image = req.file.filename;
        }

        pageDetail = await PageDetail.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: pageDetail });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete page detail
// @route   DELETE /api/page-details/:id
// @access  Private/Admin
exports.deletePageDetail = async (req, res) => {
    try {
        const pageDetail = await PageDetail.findById(req.params.id);

        if (!pageDetail) {
            return res.status(404).json({ success: false, error: 'Page detail not found' });
        }

        // Delete image
        if (pageDetail.image && pageDetail.image !== 'no-photo.jpg') {
            const imagePath = path.join(__dirname, '../uploads/', pageDetail.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await pageDetail.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
