# Email Service

This directory contains the email service implementation for sending emails using SendGrid.

## Configuration

The email service uses SendGrid's Web API for sending emails. The configuration is stored in `.env.local` file:

```
EMAIL_FROM=support@walkwithchrist.shop
SENDGRID_API_KEY=your_sendgrid_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Email Types

The service supports three types of emails:

1. **Verification Emails** - Sent when a user registers to verify their email address
2. **Password Reset Emails** - Sent when a user requests a password reset
3. **Welcome Emails** - Sent after a user verifies their email address

## Usage

### In Application Code

```typescript
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from "@/lib/email/email-service";

// Send verification email
await sendVerificationEmail(userEmail, userName, verificationCode);

// Send password reset email
await sendPasswordResetEmail(userEmail, userName, resetCode);

// Send welcome email
await sendWelcomeEmail(userEmail, userName);
```

### Test Scripts

The project includes test scripts to help verify that email sending works correctly:

1. **Basic Test Email**:
   ```
   node src/scripts/test-email.js
   ```

2. **Verification Email**:
   ```
   node src/scripts/send-verification-email.js user@example.com verification
   ```

3. **Password Reset Email**:
   ```
   node src/scripts/send-verification-email.js user@example.com reset
   ```

## Development Mode

In development mode (when `NODE_ENV !== 'production'`), emails are not actually sent. Instead, they are logged to the console for debugging purposes.

## Customizing Email Templates

Email templates are defined in `templates.ts`. You can customize the HTML and text content of the emails by modifying these templates.

Each template function returns an object with `subject`, `text`, and `html` properties, allowing both plain text and HTML versions of emails to be sent.
