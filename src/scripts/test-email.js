require('dotenv').config({ path: '.env.local' });
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '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');

async function sendTestEmail() {
  // Prompt for input would go here in a normal CLI app
  // Here we'll hardcode a recipient for testing
  const recipient = 'your_test_email@example.com'; // Replace with your email to test

  const msg = {
    to: recipient,
    from: process.env.EMAIL_FROM || 'support@walkwithchrist.shop',
    subject: 'SendGrid Test Email',
    text: 'This is a test email from SendGrid to verify the integration is working correctly.',
    html: '<strong>This is a test email from SendGrid</strong> to verify the integration is working correctly.',
  };

  try {
    console.log(`Sending test email to ${recipient}...`);
    const response = await sgMail.send(msg);
    console.log('Email sent successfully!');
    console.log('Response:', response[0].statusCode);
    console.log('Headers:', JSON.stringify(response[0].headers, null, 2));
  } catch (error) {
    console.error('Error sending test email:');
    console.error(error);

    if (error.response) {
      console.error('Error body:', error.response.body);
    }
  }
}

sendTestEmail();
