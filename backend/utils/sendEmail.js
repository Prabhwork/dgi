const nodemailer = require('nodemailer');

// Cache transporter instance
let transporter = null;

const createTransporter = () => {
    let config = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    };

    if (process.env.SMTP_HOST && process.env.SMTP_HOST.includes('gmail')) {
        config = {
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        };
    }
    return nodemailer.createTransport(config);
};

const sendEmail = (options) => {
    // Run email sending in the background so we don't block API requests
    (async () => {
        if (!transporter) {
            transporter = createTransporter();
        }

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
        } catch (error) {
            console.error('Email send error details:', error);
            // If connection lost, reset transporter for next try
            transporter = null;
        }
    })();
};

module.exports = sendEmail;
