const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protectPartner } = require('../middleware/auth');

router.use(protectPartner);
const path = require('path');

// Configure static storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed!'));
  }
});

// POST single image upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    // Construct the public URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.status(201).json({ 
      message: 'Image uploaded successfully', 
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
