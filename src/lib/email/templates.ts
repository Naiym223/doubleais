/**
 * Email Templates
 *
 * This file contains templates for various email types sent by the application.
 */

/**
 * Generates an email verification email template
 */
export function generateVerificationEmail(username: string, verificationCode: string, appUrl: string): { subject: string; text: string; html: string } {
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
export function generatePasswordResetEmail(username: string, resetCode: string, appUrl: string): { subject: string; text: string; html: string } {
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

/**
 * Generates a welcome email template (sent after verification)
 */
export function generateWelcomeEmail(username: string, appUrl: string): { subject: string; text: string; html: string } {
  const subject = "Welcome to DoubleAI!";

  // Plain text version
  const text = `
Hello ${username},

Your email has been verified and your DoubleAI account is now fully activated. Thank you for joining us!

You can now enjoy all the features of DoubleAI.

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
  <title>Welcome to DoubleAI</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background-color: #f9f9f9; border-radius: 10px; padding: 20px; border: 1px solid #ddd; }
    .footer { margin-top: 30px; font-size: 12px; color: #777; }
    .button { background-color: #4354ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Welcome to DoubleAI!</h2>
    <p>Hello ${username},</p>
    <p>Your email has been verified and your DoubleAI account is now fully activated. Thank you for joining us!</p>
    <p>You can now enjoy all the features of DoubleAI.</p>
    <a href="${appUrl}" class="button">Get Started</a>
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
