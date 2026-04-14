const EventContact = require('../models/EventContact');

exports.submitContact = async (req, res) => {
    try {
        const contact = new EventContact(req.body);
        await contact.save();

        // Send Email
        try {
            const sendEmail = require('../utils/sendEmail');
            await sendEmail({
                email: req.body.email,
                subject: 'Message Received - Digital Book of India',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <h2 style="color: #0284c7;">We've Got Your Message!</h2>
                        <p>Dear <b>${req.body.fullName}</b>,</p>
                        <p>Thank you for reaching out to us regarding <b>${req.body.subject}</b>.</p>
                        <p>We've received your message and our team will get back to you within 24 business hours.</p>
                        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <p style="margin: 0; font-size: 13px; color: #64748b;"><b>Your Message:</b></p>
                            <p style="margin: 5px 0 0 0; font-style: italic;">"${req.body.message}"</p>
                        </div>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #64748b;">This is an automated message from Digital Book of India. Please do not reply to this email.</p>
                    </div>
                `
            });
        } catch (mailErr) {
            console.error('Contact Confirmation Email Failed:', mailErr.message);
        }

        res.status(201).json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const data = await EventContact.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
