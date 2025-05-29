/**
 * Email Service
 *
 * This file contains the email service for sending emails using SendGrid.
 * In development mode, emails are logged to the console instead of being sent.
 */

import * as templates from './templates';

// Email service configuration
const config = {
  from: process.env.EMAIL_FROM || 'support@walkwithchrist.shop',
  sendgridApiKey: process.env.SENDGRID_API_KEY || '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',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  isDevelopment: process.env.NODE_ENV !== 'production'
};

/**
 * Email service interface
 */
interface EmailService {
  sendVerificationEmail(email: string, name: string, verificationCode: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, name: string, resetCode: string): Promise<boolean>;
  sendWelcomeEmail(email: string, name: string): Promise<boolean>;
}

/**
 * Development email service that logs emails to console
 */
class DevelopmentEmailService implements EmailService {
  async sendVerificationEmail(email: string, name: string, verificationCode: string): Promise<boolean> {
    const template = templates.generateVerificationEmail(name, verificationCode, config.appUrl);
    console.log('=============================================');
    console.log(`📧 VERIFICATION EMAIL (DEV MODE - NOT ACTUALLY SENT)`);
    console.log(`📧 To: ${email}`);
    console.log(`📧 Subject: ${template.subject}`);
    console.log('📧 Content:');
    console.log(template.text);
    console.log('=============================================');
    return true;
  }

  async sendPasswordResetEmail(email: string, name: string, resetCode: string): Promise<boolean> {
    const template = templates.generatePasswordResetEmail(name, resetCode, config.appUrl);
    console.log('=============================================');
    console.log(`📧 PASSWORD RESET EMAIL (DEV MODE - NOT ACTUALLY SENT)`);
    console.log(`📧 To: ${email}`);
    console.log(`📧 Subject: ${template.subject}`);
    console.log('📧 Content:');
    console.log(template.text);
    console.log('=============================================');
    return true;
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const template = templates.generateWelcomeEmail(name, config.appUrl);
    console.log('=============================================');
    console.log(`📧 WELCOME EMAIL (DEV MODE - NOT ACTUALLY SENT)`);
    console.log(`📧 To: ${email}`);
    console.log(`📧 Subject: ${template.subject}`);
    console.log('📧 Content:');
    console.log(template.text);
    console.log('=============================================');
    return true;
  }
}

/**
 * SendGrid email service
 */
class SendGridEmailService implements EmailService {
  private sendgrid: any;

  constructor(apiKey: string) {
    // This is a dynamic import to avoid issues during build time
    this.initializeSendGrid(apiKey);
  }

  private async initializeSendGrid(apiKey: string) {
    try {
      // Dynamic import of SendGrid
      const sendgridModule = await import('@sendgrid/mail');
      this.sendgrid = sendgridModule.default;
      this.sendgrid.setApiKey(apiKey);
    } catch (error) {
      console.error('Failed to initialize SendGrid:', error);
    }
  }

  private async sendEmail(to: string, subject: string, text: string, html: string): Promise<boolean> {
    if (!this.sendgrid) {
      console.error('SendGrid not initialized');
      return false;
    }

    try {
      const msg = {
        to,
        from: config.from,
        subject,
        text,
        html
      };

      await this.sendgrid.send(msg);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, name: string, verificationCode: string): Promise<boolean> {
    const template = templates.generateVerificationEmail(name, verificationCode, config.appUrl);
    return this.sendEmail(email, template.subject, template.text, template.html);
  }

  async sendPasswordResetEmail(email: string, name: string, resetCode: string): Promise<boolean> {
    const template = templates.generatePasswordResetEmail(name, resetCode, config.appUrl);
    return this.sendEmail(email, template.subject, template.text, template.html);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const template = templates.generateWelcomeEmail(name, config.appUrl);
    return this.sendEmail(email, template.subject, template.text, template.html);
  }
}

/**
 * Factory function to create the appropriate email service
 */
function createEmailService(): EmailService {
  if (config.isDevelopment || !config.sendgridApiKey) {
    console.log('🔄 Using development email service (emails will be logged to console)');
    return new DevelopmentEmailService();
  }

  console.log('🔄 Using SendGrid email service');
  return new SendGridEmailService(config.sendgridApiKey);
}

// Export the email service instance
export const emailService = createEmailService();

// Export additional utility functions
export async function sendVerificationEmail(email: string, name: string, verificationCode: string): Promise<boolean> {
  return emailService.sendVerificationEmail(email, name, verificationCode);
}

export async function sendPasswordResetEmail(email: string, name: string, resetCode: string): Promise<boolean> {
  return emailService.sendPasswordResetEmail(email, name, resetCode);
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return emailService.sendWelcomeEmail(email, name);
}
