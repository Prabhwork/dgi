const getOTPTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DBI Verification Code</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0a0a0c;
                margin: 0;
                padding: 0;
                color: #ffffff;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background: #16161a;
                border-radius: 24px;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            }
            .header {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 800;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #ffffff;
            }
            .content {
                padding: 40px;
                text-align: center;
            }
            .content p {
                font-size: 16px;
                line-height: 1.6;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 30px;
            }
            .otp-container {
                background: rgba(59, 130, 246, 0.1);
                border: 1px dashed rgba(59, 130, 246, 0.5);
                border-radius: 16px;
                padding: 30px;
                margin: 20px 0;
            }
            .otp-code {
                font-size: 48px;
                font-weight: 800;
                letter-spacing: 12px;
                color: #3b82f6;
                margin: 0;
                text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            }
            .footer {
                padding: 30px;
                text-align: center;
                background: rgba(0, 0, 0, 0.2);
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }
            .footer p {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.4);
                margin: 5px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .brand {
                color: #3b82f6;
                font-weight: 700;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verification <span style="font-style: italic; opacity: 0.9;">Code</span></h1>
            </div>
            <div class="content">
                <p>Welcome to the DBI Community! Use the following code to verify your official email address and unlock your business portal.</p>
                <div class="otp-container">
                    <h2 class="otp-code">${otp}</h2>
                </div>
                <p style="font-size: 14px; margin-top: 30px;">
                    This code will expire in <strong>10 minutes</strong>.<br>
                    If you did not request this, please ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>© 2026 <span class="brand">DBI</span> - DIGITAL BOOK OF INDIA</p>
                <p>Trusted Network of Verified Businesses</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const getRegistrationSuccessTemplate = (businessName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Received - DBI Community</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0c; margin: 0; padding: 0; color: #ffffff; }
            .container { max-width: 600px; margin: 40px auto; background: #16161a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #ffffff; }
            .content { padding: 40px; text-align: left; }
            .content p { font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.7); margin-bottom: 20px; }
            .highlight-box { background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .footer { padding: 30px; text-align: center; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.05); }
            .footer p { font-size: 12px; color: rgba(255, 255, 255, 0.4); margin: 5px 0; text-transform: uppercase; letter-spacing: 1px; }
            .brand { color: #3b82f6; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Application <span style="font-style: italic; opacity: 0.9;">Received</span></h1>
            </div>
            <div class="content">
                <p>Hello <strong>${businessName}</strong>,</p>
                <p>Thank you for registering with the <strong>DBI (Digital Book of India) Community</strong>. Your application has been successfully received and is now in our verification queue.</p>
                
                <div class="highlight-box">
                    <p style="margin: 0; color: #ffffff; font-weight: 600;">Verification status: <span style="color: #fbbf24;">Pending Approval</span></p>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">Next steps will be updated within <strong>24 to 48 hours</strong>.</p>
                </div>

                <p>Our team is manually and automatically checking your documents to ensure the integrity of our verified business network. Please wait for your business approval; we will notify you once the process is complete.</p>
                
                <p>Thank you for your patience as we work to build a more secure and transparent digital marketplace.</p>
            </div>
            <div class="footer">
                <p>© 2026 <span class="brand">DBI</span> - DIGITAL BOOK OF INDIA</p>
                <p>Trusted Network of Verified Businesses</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const getRejectionTemplate = (businessName, reason) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Status Update - DBI Community</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0c; margin: 0; padding: 0; color: #ffffff; }
            .container { max-width: 600px; margin: 40px auto; background: #16161a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { background: #ef4444; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #ffffff; }
            .content { padding: 40px; text-align: left; }
            .content p { font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.7); margin-bottom: 20px; }
            .reason-box { background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .button-wrapper { text-align: center; margin: 35px 0; }
            .btn { background: #3b82f6; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3); }
            .steps { background: rgba(255, 255, 255, 0.03); border-radius: 16px; padding: 25px; margin-top: 30px; border: 1px solid rgba(255, 255, 255, 0.05); }
            .steps h3 { margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; color: #3b82f6; letter-spacing: 1px; }
            .steps ol { margin: 0; padding-left: 20px; color: rgba(255, 255, 255, 0.6); font-size: 14px; }
            .steps li { margin-bottom: 10px; }
            .footer { padding: 30px; text-align: center; background: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.05); }
            .footer p { font-size: 12px; color: rgba(255, 255, 255, 0.4); margin: 5px 0; text-transform: uppercase; letter-spacing: 1px; }
            .brand { color: #3b82f6; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Action <span style="font-style: italic; opacity: 0.9;">Required</span></h1>
            </div>
            <div class="content">
                <p>Hello <strong>${businessName}</strong>,</p>
                <p>Your application for the <strong>DBI Community</strong> has been reviewed. Unfortunately, we cannot approve it at this time due to the following reason(s):</p>
                
                <div class="reason-box">
                    <p style="margin: 0; color: #ffffff; font-weight: 600;">Reason for rejection:</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #ef4444;">${reason}</p>
                </div>

                <div class="button-wrapper">
                    <a href="http://localhost:3001/community/login" class="btn">Update My Details</a>
                </div>

                <div class="steps">
                    <h3>How to Resubmit:</h3>
                    <ol>
                        <li>Click the <strong>Update My Details</strong> button above.</li>
                        <li>Log in using your registered email and password.</li>
                        <li>On your status page, click the <strong>Update & Resubmit</strong> button.</li>
                        <li>Fix the highlighted issues and submit your application again.</li>
                    </ol>
                </div>
                
                <p style="margin-top: 30px;">Our team will re-evaluate your application within 24 hours of resubmission.</p>
            </div>
            <div class="footer">
                <p>© 2026 <span class="brand">DBI</span> - DIGITAL BOOK OF INDIA</p>
                <p>Trusted Network of Verified Businesses</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getOTPTemplate, getRegistrationSuccessTemplate, getRejectionTemplate };
