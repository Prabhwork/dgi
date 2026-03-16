require('dotenv').config({ path: 'c:/Users/PRABHJOT SINGH/Desktop/digital/backend/.env' });
const sendEmail = require('c:/Users/PRABHJOT SINGH/Desktop/digital/backend/utils/sendEmail');
const { getRegistrationSuccessTemplate } = require('c:/Users/PRABHJOT SINGH/Desktop/digital/backend/utils/emailTemplates');

async function testEmail() {
    const businessName = "Test Business Alpha";
    const email = process.env.SMTP_EMAIL; // Send to self for testing

    console.log(`Sending test registration success email to ${email}...`);

    try {
        const html = getRegistrationSuccessTemplate(businessName);
        await sendEmail({
            email,
            subject: 'TEST: Registration Received - DBI Community',
            message: `Hello ${businessName}, your registration with DBI Community has been received.`,
            html: html
        });
        console.log('✅ Test email sent successfully!');
    } catch (error) {
        console.error('❌ Failed to send test email:', error);
    }
}

testEmail();
