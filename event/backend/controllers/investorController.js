const EventInvestor = require('../models/EventInvestor');

exports.registerInvestor = async (req, res) => {
    try {
        const files = req.files;
        const data = {
            ...req.body,
            preferredCategories: req.body.preferredCategories ? req.body.preferredCategories.split(',') : [],
            investmentType: req.body.investmentType ? req.body.investmentType.split(',') : [],
            selfie: files?.selfie?.[0]?.path,
            documentUpload: files?.documentUpload?.[0]?.path
        };
        const registration = new EventInvestor(data);
        await registration.save();

        // Send Email
        try {
            const sendEmail = require('../utils/sendEmail');
            await sendEmail({
                email: data.email,
                subject: 'Investor Registration Received - Digital Book of India',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <h2 style="color: #0284c7;">Welcome to the Network!</h2>
                        <p>Dear <b>${data.fullName}</b>,</p>
                        <p>Thank you for registering as an investor with Digital Book of India.</p>
                        <p>We are currently verifying your credentials and documentation. Once cleared, you will receive access to our premium deal flow and business connects.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #64748b;">This is an automated message from Digital Book of India. Please do not reply to this email.</p>
                    </div>
                `
            });
        } catch (mailErr) {
            console.error('Investor Confirmation Email Failed:', mailErr.message);
        }

        res.status(201).json({ message: 'Investor registration submitted successfully', id: registration._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getInvestors = async (req, res) => {
    try {
        const data = await EventInvestor.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
