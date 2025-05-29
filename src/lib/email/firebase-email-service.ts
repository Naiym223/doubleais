/**
 * Firebase Email Service
 *
 * This service leverages Firebase Authentication's built-in email functionality
 * for verification emails, password reset emails, etc.
 */

import {
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import { clientAuth } from '../firebase';

// Configuration
const config = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  isDevelopment: process.env.NODE_ENV !== 'production'
};

/**
 * Email service interface
 */
interface EmailService {
  sendVerificationEmail(user: FirebaseUser): Promise<boolean>;
  sendPasswordResetEmail(email: string): Promise<boolean>;
}

/**
 * Development email service that logs emails to console
 */
class DevelopmentEmailService implements EmailService {
  async sendVerificationEmail(user: FirebaseUser): Promise<boolean> {
    console.log('=============================================');
    console.log(`📧 VERIFICATION EMAIL (DEV MODE - NOT ACTUALLY SENT)`);
    console.log(`📧 To: ${user.email}`);
    console.log(`📧 Subject: Verify your email address`);
    console.log(`📧 Verification link would be sent to the user's email`);
    console.log('=============================================');
    return true;
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    console.log('=============================================');
    console.log(`📧 PASSWORD RESET EMAIL (DEV MODE - NOT ACTUALLY SENT)`);
    console.log(`📧 To: ${email}`);
    console.log(`📧 Subject: Reset your password`);
    console.log(`📧 Password reset link would be sent to the user's email`);
    console.log('=============================================');
    return true;
  }
}

/**
 * Firebase Authentication email service
 */
class FirebaseEmailService implements EmailService {
  /**
   * Send email verification using Firebase Authentication
   */
  async sendVerificationEmail(user: FirebaseUser): Promise<boolean> {
    try {
      // Firebase handles the email verification template and sending
      await sendEmailVerification(user, {
        url: `${config.appUrl}/login?email=${user.email}`,
      });

      console.log(`📧 Verification email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * Send password reset email using Firebase Authentication
   */
  async sendPasswordResetEmail(email: string): Promise<boolean> {
    try {
      // Firebase handles the password reset template and sending
      await sendPasswordResetEmail(clientAuth, email, {
        url: `${config.appUrl}/login`,
      });

      console.log(`📧 Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }
}

/**
 * Factory function to create the appropriate email service
 */
function createEmailService(): EmailService {
  if (config.isDevelopment) {
    console.log('🔄 Using development email service (emails will be logged to console)');
    return new DevelopmentEmailService();
  }

  console.log('🔄 Using Firebase email service');
  return new FirebaseEmailService();
}

// Export the email service instance
export const emailService = createEmailService();

// Export helper functions for direct usage
export async function sendVerificationEmailToUser(user: FirebaseUser): Promise<boolean> {
  return emailService.sendVerificationEmail(user);
}

export async function sendPasswordResetEmailToUser(email: string): Promise<boolean> {
  return emailService.sendPasswordResetEmail(email);
}
