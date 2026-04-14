const nodemailer = require('nodemailer');

const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
const isSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: smtpPort,
    secure: isSecure,
    auth: {
        user: process.env.SMTP_USER || process.env.BREVO_SMTP_USER || process.env.BREVO_SENDER_EMAIL,
        pass: process.env.SMTP_PASS || process.env.BREVO_API_KEY,
    },
});

/**
 * Send email via SMTP (Nodemailer)
 * @param {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
    const senderEmail = process.env.SMTP_FROM_EMAIL || process.env.BREVO_SENDER_EMAIL || 'affinitytechnologies.pro@gmail.com'; 
    const fromName = process.env.SMTP_FROM_NAME || process.env.BREVO_SENDER_NAME || 'Digital Book of India';
    
    const mailOptions = {
        from: `"${fromName}" <${senderEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('SMTP Email error:', error.message);
        throw new Error('Email sending failed: ' + error.message);
    }
};

module.exports = sendEmail;
