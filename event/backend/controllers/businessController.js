const EventBusiness = require('../models/EventBusiness');

exports.registerBusiness = async (req, res) => {
    try {
        const files = req.files;
        const data = {
            ...req.body,
            businessImages: files?.businessImages?.[0]?.path,
            pitchDeck: files?.pitchDeck?.[0]?.path,
            selfie: files?.selfie?.[0]?.path
        };
        const registration = new EventBusiness(data);
        await registration.save();

        // Send Email
        try {
            const sendEmail = require('../utils/sendEmail');
            await sendEmail({
                email: data.email,
                subject: 'Business Registration Received - Digital Book of India',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <h2 style="color: #0284c7;">Thank You for Registering!</h2>
                        <p>Dear <b>${data.ownerName}</b>,</p>
                        <p>We have successfully received your business application for <b>${data.businessName}</b>.</p>
                        <p>Our team is currently reviewing your profile and pitch deck. You can expect to hear from us within 2-3 business days.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #64748b;">This is an automated message from Digital Book of India. Please do not reply to this email.</p>
                    </div>
                `
            });
        } catch (mailErr) {
            console.error('Business Confirmation Email Failed:', mailErr.message);
        }

        res.status(201).json({ message: 'Business application submitted successfully', id: registration._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getBusinesses = async (req, res) => {
    try {
        const data = await EventBusiness.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
