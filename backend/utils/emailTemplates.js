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
                    <a href="${process.env.FRONTEND_URL}/community/login" class="btn">Update My Details</a>
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

// ─── CLAIM APPROVED → CLAIMER ─────────────────────────────────────────────
const getClaimApprovedClaimerTemplate = (claimerName, businessName, resetLink) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ownership Confirmed – DBI</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0c; margin: 0; padding: 0; color: #ffffff; }
            .container { max-width: 600px; margin: 40px auto; background: #16161a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 44px 20px; text-align: center; }
            .trophy { font-size: 52px; display: block; margin-bottom: 12px; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #fff; }
            .header p { margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px; }
            .content { padding: 40px; }
            .content p { font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.75); margin-bottom: 18px; }
            .highlight-box { background: rgba(16,185,129,0.1); border-left: 4px solid #10b981; border-radius: 10px; padding: 18px 20px; margin: 24px 0; }
            .highlight-box p { margin: 0; color: #ffffff; font-weight: 600; font-size: 15px; }
            .highlight-box span { color: #34d399; }
            .steps-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin: 24px 0; }
            .steps-box h3 { margin: 0 0 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #10b981; }
            .steps-box ol { margin: 0; padding-left: 20px; color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.8; }
            .btn-wrapper { text-align: center; margin: 36px 0 20px; }
            .btn { background: linear-gradient(135deg, #10b981, #059669); color: #ffffff !important; padding: 16px 40px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; display: inline-block; box-shadow: 0 12px 24px rgba(16,185,129,0.35); }
            .warning-box { background: rgba(251,191,36,0.08); border-left: 4px solid #fbbf24; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
            .warning-box p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.65); }
            .warning-box strong { color: #fbbf24; }
            .footer { padding: 28px; text-align: center; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); }
            .footer p { font-size: 11px; color: rgba(255,255,255,0.35); margin: 4px 0; text-transform: uppercase; letter-spacing: 1px; }
            .brand { color: #10b981; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="trophy">🎉</span>
                <h1>Ownership <span style="font-style:italic;opacity:0.9;">Confirmed</span></h1>
                <p>Your claim has been reviewed and approved by DBI Admin</p>
            </div>
            <div class="content">
                <p>Hello <strong>${claimerName}</strong>,</p>
                <p>Congratulations! After carefully reviewing your submitted ownership proof, our admin team has <strong style="color:#34d399;">approved your claim</strong> for the following business:</p>

                <div class="highlight-box">
                    <p>🏢 Business: <span>${businessName}</span></p>
                </div>

                <p>You are now the <strong>verified owner</strong> of this business on DBI. To secure your account and gain full access to your business dashboard, you must reset your password immediately using the link below.</p>

                <div class="btn-wrapper">
                    <a href="${resetLink}" class="btn">🔐 Reset My Password</a>
                </div>

                <div class="warning-box">
                    <p><strong>⚠️ Important:</strong> Your account credentials have been refreshed as part of the ownership transfer. Please use the link above to set a new password. We also recommend enabling <strong>Two-Factor Authentication (2FA)</strong> from your dashboard after logging in for maximum security.</p>
                </div>

                <div class="steps-box">
                    <h3>Next Steps</h3>
                    <ol>
                        <li>Click <strong>Reset My Password</strong> above to set a new password.</li>
                        <li>Log in to your DBI Business Dashboard.</li>
                        <li>Review and update your business profile information.</li>
                        <li>Enable <strong>Two-Factor Authentication (2FA)</strong> for extra security.</li>
                    </ol>
                </div>

                <p style="font-size:13px; color:rgba(255,255,255,0.5);">If you did not submit this claim or believe this is an error, please contact our support team immediately.</p>
            </div>
            <div class="footer">
                <p>© 2026 <span class="brand">DBI</span> — DIGITAL BOOK OF INDIA</p>
                <p>Trusted Network of Verified Businesses</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ─── CLAIM REJECTED → CLAIMER ─────────────────────────────────────────────
const getClaimRejectedClaimerTemplate = (claimerName, businessName, reason) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Claim Status Update – DBI</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0c; margin: 0; padding: 0; color: #ffffff; }
            .container { max-width: 600px; margin: 40px auto; background: #16161a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 44px 20px; text-align: center; }
            .icon { font-size: 52px; display: block; margin-bottom: 12px; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #fff; }
            .header p { margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px; }
            .content { padding: 40px; }
            .content p { font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.75); margin-bottom: 18px; }
            .reason-box { background: rgba(239,68,68,0.1); border-left: 4px solid #ef4444; border-radius: 10px; padding: 18px 20px; margin: 24px 0; }
            .reason-box .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
            .reason-box .text { font-size: 14px; color: #fca5a5; font-style: italic; line-height: 1.6; }
            .info-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin: 24px 0; }
            .info-box h3 { margin: 0 0 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #f87171; }
            .info-box p { margin: 0; font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.7; }
            .footer { padding: 28px; text-align: center; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); }
            .footer p { font-size: 11px; color: rgba(255,255,255,0.35); margin: 4px 0; text-transform: uppercase; letter-spacing: 1px; }
            .brand { color: #3b82f6; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="icon">🚫</span>
                <h1>Claim <span style="font-style:italic;opacity:0.9;">Rejected</span></h1>
                <p>Your ownership claim could not be verified at this time</p>
            </div>
            <div class="content">
                <p>Hello <strong>${claimerName}</strong>,</p>
                <p>After a thorough review of your ownership claim for <strong>${businessName}</strong>, our admin team was unable to approve your request.</p>

                <div class="reason-box">
                    <div class="label">Reason for Rejection</div>
                    <div class="text">${reason || 'The submitted proof did not meet our verification standards.'}</div>
                </div>

                <div class="info-box">
                    <h3>What this means</h3>
                    <p>The business listing remains under its current owner. If you believe this decision was made in error, or if you have additional documentation to support your claim, please contact our support team with your reference details.</p>
                </div>

                <p style="font-size:13px; color:rgba(255,255,255,0.5);">If you were not the one who submitted this claim, please disregard this email. No action has been taken on your account.</p>
            </div>
            <div class="footer">
                <p>© 2026 <span class="brand">DBI</span> — DIGITAL BOOK OF INDIA</p>
                <p>Trusted Network of Verified Businesses</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ─── CLAIM APPROVED → ORIGINAL OWNER (ALERT) ──────────────────────────────
const getClaimApprovedOwnerAlertTemplate = (businessName, claimerName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Business Ownership Transferred – DBI</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0c; margin: 0; padding: 0; color: #ffffff; }
            .container { max-width: 600px; margin: 40px auto; background: #16161a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 44px 20px; text-align: center; }
            .icon { font-size: 52px; display: block; margin-bottom: 12px; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #fff; }
            .header p { margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
            .content { padding: 40px; }
            .content p { font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.75); margin-bottom: 18px; }
            .alert-box { background: rgba(245,158,11,0.1); border-left: 4px solid #f59e0b; border-radius: 10px; padding: 18px 20px; margin: 24px 0; }
            .alert-box p { margin: 0; color: #fff; font-weight: 600; font-size: 15px; }
            .alert-box span { color: #fcd34d; }
            .info-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin: 24px 0; }
            .info-box h3 { margin: 0 0 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #fbbf24; }
            .info-box p { margin: 0; font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.7; }
            .footer { padding: 28px; text-align: center; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); }
            .footer p { font-size: 11px; color: rgba(255,255,255,0.35); margin: 4px 0; text-transform: uppercase; letter-spacing: 1px; }
            .brand { color: #3b82f6; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="icon">⚠️</span>
                <h1>Ownership <span style="font-style:italic;opacity:0.9;">Transferred</span></h1>
                <p>Administrative notice regarding your DBI business listing</p>
            </div>
            <div class="content">
                <p>This is an <strong>official notice</strong> from DBI Admin.</p>

                <div class="alert-box">
                    <p>🏢 Business: <span>${businessName}</span></p>
                    <p style="margin-top:8px;">👤 New Owner: <span>${claimerName}</span></p>
                </div>

                <p>After verifying valid ownership documentation submitted by <strong>${claimerName}</strong>, our admin team has completed the ownership transfer for the above business listing.</p>

                <div class="info-box">
                    <h3>What happened</h3>
                    <p>A verified claim was submitted and approved through the DBI platform. The new owner's credentials have been activated and the business profile is now under their management. This is an automated administrative notice for your records.</p>
                </div>

                <p style="font-size:13px; color:rgba(255,255,255,0.5);">If you believe this transfer was made in error, please contact DBI support immediately with your business registration documents.</p>
            </div>
            <div class="footer">
                <p>© 2026 <span class="brand">DBI</span> — DIGITAL BOOK OF INDIA</p>
                <p>Trusted Network of Verified Businesses</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ─── CLAIM REJECTED → ORIGINAL OWNER (ALERT) ──────────────────────────────
const getClaimRejectedOwnerAlertTemplate = (businessName, claimerName) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Claim Attempt Rejected – DBI</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0c; margin: 0; padding: 0; color: #ffffff; }
            .container { max-width: 600px; margin: 40px auto; background: #16161a; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 44px 20px; text-align: center; }
            .icon { font-size: 52px; display: block; margin-bottom: 12px; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #fff; }
            .header p { margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px; }
            .content { padding: 40px; }
            .content p { font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.75); margin-bottom: 18px; }
            .safe-box { background: rgba(59,130,246,0.1); border-left: 4px solid #3b82f6; border-radius: 10px; padding: 18px 20px; margin: 24px 0; }
            .safe-box p { margin: 0; color: #fff; font-weight: 600; font-size: 15px; }
            .safe-box span { color: #93c5fd; }
            .info-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; margin: 24px 0; }
            .info-box h3 { margin: 0 0 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #60a5fa; }
            .info-box p { margin: 0; font-size: 14px; color: rgba(255,255,255,0.55); line-height: 1.7; }
            .footer { padding: 28px; text-align: center; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); }
            .footer p { font-size: 11px; color: rgba(255,255,255,0.35); margin: 4px 0; text-transform: uppercase; letter-spacing: 1px; }
            .brand { color: #3b82f6; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="icon">🛡️</span>
                <h1>Your Business is <span style="font-style:italic;opacity:0.9;">Protected</span></h1>
                <p>A claim attempt on your listing was reviewed and rejected</p>
            </div>
            <div class="content">
                <p>This is an <strong>official security notice</strong> from DBI Admin.</p>

                <div class="safe-box">
                    <p>🏢 Business: <span>${businessName}</span></p>
                    <p style="margin-top:8px;">🚫 Attempted by: <span>${claimerName}</span></p>
                </div>

                <p>Someone recently submitted an ownership claim for your business listing on DBI. After a thorough review, our admin team has <strong style="color:#34d399;">rejected the claim</strong>. Your business remains safely under your ownership — no changes have been made to your account.</p>

                <div class="info-box">
                    <h3>You are still the owner</h3>
                    <p>The claim attempt did not meet our verification standards and was denied. Your account credentials, business details, and listing are all unchanged. This is purely an informational notice for your security awareness.</p>
                </div>

                <p style="font-size:13px; color:rgba(255,255,255,0.5);">If you have any concerns about the security of your account, we recommend enabling Two-Factor Authentication (2FA) from your business dashboard.</p>
            </div>
            <div class="footer">
                <p>© 2026 <span class="brand">DBI</span> — DIGITAL BOOK OF INDIA</p>
                <p>Trusted Network of Verified Businesses</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const getUserNotificationTemplate = (userName, title, message, icon = '🔔', color = '#3b82f6', metadata = null, disclaimer = null) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - DBI</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .header { background: ${color}; padding: 44px 20px; text-align: center; }
            .icon { font-size: 48px; display: block; margin-bottom: 12px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #ffffff; }
            .content { padding: 40px; }
            .content p { font-size: 16px; line-height: 1.7; color: #475569; margin-bottom: 20px; }
            .user-greet { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
            .info-box { background: #f1f5f9; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #e2e8f0; }
            .info-box p { margin: 0; font-size: 15px; color: #334155; font-weight: 500; }
            .metadata { background: #fafafa; border-radius: 12px; padding: 15px; margin: 20px 0; border: 1px solid #eee; font-size: 13px; color: #666; }
            .metadata-item { margin-bottom: 5px; }
            .metadata-label { font-weight: 700; color: #333; }
            .disclaimer { font-size: 13px; color: #94a3b8; font-style: italic; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
            .footer { padding: 28px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0; }
            .footer p { font-size: 11px; color: #94a3b8; margin: 4px 0; text-transform: uppercase; letter-spacing: 1px; }
            .brand { color: ${color}; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="icon">${icon}</span>
                <h1>${title}</h1>
            </div>
            <div class="content">
                <p class="user-greet">Hello ${userName},</p>
                <div class="info-box">
                    <p>${message}</p>
                </div>
                
                ${metadata ? `
                <div class="metadata">
                    ${Object.entries(metadata).map(([key, value]) => `
                        <div class="metadata-item">
                            <span class="metadata-label">${key}:</span> ${value}
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${disclaimer ? `<p class="disclaimer">${disclaimer}</p>` : ''}

                <p style="margin-top: 20px;">If you have any questions regarding this notification, please feel free to reach out to our support team.</p>
                <p>Thank you for being a valued member of the DBI Community.</p>
            </div>
            <div class="footer">
                <p>© 2026—2027 <span class="brand">DBI</span> — DIGITAL BOOK OF INDIA</p>
                <p>Ensuring Security and Excellence</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const getResetOTPTemplate = (userName, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - DBI</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; margin: 0; padding: 0; color: #1c1e21; }
            .wrapper { width: 100%; table-layout: fixed; background-color: #f0f2f5; padding-bottom: 40px; }
            .main { background-color: #ffffff; margin: 40px auto; max-width: 600px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 50px 20px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
            .header p { margin-top: 10px; opacity: 0.9; font-size: 14px; letter-spacing: 1px; }
            .content { padding: 40px; text-align: center; }
            .content h2 { color: #0f172a; margin-bottom: 10px; font-size: 22px; }
            .content p { color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 30px; }
            .otp-container { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 30px; margin: 20px 0; display: inline-block; width: 80%; }
            .otp-code { font-size: 42px; font-weight: 900; color: #1d4ed8; letter-spacing: 12px; margin: 0; padding-left: 12px; }
            .expiry { font-size: 12px; color: #94a3b8; margin-top: 15px; font-weight: 600; text-transform: uppercase; }
            .footer { padding: 30px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0; }
            .footer p { margin: 5px 0; font-size: 12px; color: #64748b; }
            .security-note { font-size: 13px; color: #ef4444; font-weight: 600; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="main">
                <div class="header">
                    <h1>RECOVERY</h1>
                    <p>DIGITAL BOOK OF INDIA</p>
                </div>
                <div class="content">
                    <h2>Hello, ${userName}</h2>
                    <p>We received a request to reset your business portal password. Use the verification code below to proceed:</p>
                    
                    <div class="otp-container">
                        <div class="otp-code">${otp}</div>
                        <div class="expiry">Expires in 10 minutes</div>
                    </div>

                    <p class="security-note">If you did not request this password reset, please secure your account or contact our support team immediately.</p>
                </div>
                <div class="footer">
                    <p>© 2026—2027 <b>DBI</b> — Digital Book of India</p>
                    <p>Securing the future of Indian Commerce</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { 
    getOTPTemplate, 
    getRegistrationSuccessTemplate, 
    getRejectionTemplate,
    getClaimApprovedClaimerTemplate,
    getClaimRejectedClaimerTemplate,
    getClaimApprovedOwnerAlertTemplate,
    getClaimRejectedOwnerAlertTemplate,
    getUserNotificationTemplate,
    getResetOTPTemplate
};
