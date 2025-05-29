require('dotenv').config({ path: '.env.local' });
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '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');
const fromEmail = process.env.EMAIL_FROM || 'support@walkwithchrist.shop';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Generates an email verification email template
 */
function generateVerificationEmail(username, verificationCode) {
  const subject = "Verify your DoubleAI account";

  // Plain text version
  const text = `
Hello ${username},

Thank you for creating a DoubleAI account. Please verify your email by entering this code:

${verificationCode}

This code will expire in 24 hours.

If you did not create this account, please ignore this email.

Best regards,
The DoubleAI Team
`;

  // HTML version
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your DoubleAI account</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #f9f9f9; border-radius: 10px; padding: 20px; border: 1px solid #ddd; }
    .code { background-color: #eee; font-family: monospace; padding: 10px 15px; font-size: 24px; border-radius: 5px; letter-spacing: 2px; display: inline-block; margin: 15px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #777; }
    .button { background-color: #4354ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Verify your email address</h2>
    <p>Hello ${username},</p>
    <p>Thank you for creating a DoubleAI account. Please use the following code to verify your email address:</p>
    <div class="code">${verificationCode}</div>
    <p>This code will expire in 24 hours.</p>
    <p>If you did not create this account, please ignore this email.</p>
    <p>Best regards,<br>The DoubleAI Team</p>
  </div>
  <div class="footer">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}

/**
 * Generates a password reset email template
 */
function generatePasswordResetEmail(username, resetCode) {
  const subject = "Reset your DoubleAI password";

  // Plain text version
  const text = `
Hello ${username},

You recently requested to reset your password for your DoubleAI account. Please use the following code to reset your password:

${resetCode}

This code will expire in 1 hour.

If you did not request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The DoubleAI Team
`;

  // HTML version
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your DoubleAI password</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #f9f9f9; border-radius: 10px; padding: 20px; border: 1px solid #ddd; }
    .code { background-color: #eee; font-family: monospace; padding: 10px 15px; font-size: 24px; border-radius: 5px; letter-spacing: 2px; display: inline-block; margin: 15px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #777; }
    .button { background-color: #4354ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Reset Your Password</h2>
    <p>Hello ${username},</p>
    <p>You recently requested to reset your password for your DoubleAI account. Use the code below to complete the process:</p>
    <div class="code">${resetCode}</div>
    <p>This code will expire in 1 hour for security reasons.</p>
    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
    <p>Best regards,<br>The DoubleAI Team</p>
  </div>
  <div class="footer">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}

async function sendEmail(recipient, emailType = 'verification') {
  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Get username from email
  const username = recipient.split('@')[0];

  // Determine which template to use
  let template;
  if (emailType === 'reset') {
    template = generatePasswordResetEmail(username, code);
  } else {
    template = generateVerificationEmail(username, code);
  }

  const msg = {
    to: recipient,
    from: fromEmail,
    subject: template.subject,
    text: template.text,
    html: template.html,
  };

  try {
    console.log(`Sending ${emailType} email to ${recipient}...`);
    const response = await sgMail.send(msg);
    console.log('Email sent successfully!');
    console.log('Response:', response[0].statusCode);
    console.log(`Verification Code: ${code}`);
  } catch (error) {
    console.error('Error sending email:');
    console.error(error);

    if (error.response) {
      console.error('Error body:', error.response.body);
    }
  }
}

// Get email from command line args
const args = process.argv.slice(2);
const recipient = args[0];
const emailType = args[1] || 'verification'; // 'verification' or 'reset'

if (!recipient) {
  console.log('Usage: node send-verification-email.js <email> [verification|reset]');
  console.log('Example: node send-verification-email.js user@example.com verification');
  process.exit(1);
}

sendEmail(recipient, emailType);
