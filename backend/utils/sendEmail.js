const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.BREVO_SMTP_USER || process.env.BREVO_SENDER_EMAIL,
        pass: process.env.BREVO_API_KEY,
    },
});

/**
 * Send email via SMTP (Nodemailer)
 * @param {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
    // IMPORTANT: Using the verified sender email confirmed from your Brevo Dashboard
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'affinitytechnologies.pro@gmail.com'; 
    const fromName = process.env.FROM_NAME || 'Digital Book of India';
    
    const mailOptions = {
        from: `"${fromName}" <${senderEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html, // Restore HTML templates
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('SMTP Email error:', error.message);
    }
};

module.exports = sendEmail;
