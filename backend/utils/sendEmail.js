const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporterConfig = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    };

    // If using gmail, we can simplify with service: 'gmail'
    if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail')) {
        transporterConfig = {
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    const message = {
        from: `"${process.env.FROM_NAME}" <no-reply@dbi.com>`,
        replyTo: 'no-reply@dbi.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Email send error details:', error);
        throw error;
    }
};

module.exports = sendEmail;
