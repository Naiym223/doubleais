"use client";

import {
  signUp,
  signOut,
  getCurrentUser,
  UserResponse,
  signIn
} from "@/lib/auth/firebase-auth"; // Now using Firebase auth instead of Supabase
import { clearChatLocalStorage } from "@/lib/chat-utils";

// Types
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  email_verified?: boolean;
}

// Auth store with Firebase integration
class AuthStore {
  // Check if user is logged in (client-side check for UI purposes)
  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('currentUser');
  }

  // Get current user from localStorage (for quick UI responses)
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userData = localStorage.getItem('currentUser');
    if (!userData) return null;

    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Check if current user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  // Login with Firebase
  async login(email: string, password: string): Promise<User> {
    try {
      // Clear any previous user's chat data
      clearChatLocalStorage();

      // Demo admin user bypass for development
      if (email === 'admin@example.com' && password === 'admin') {
        const adminUser: User = {
          id: 'admin-id', // Use a consistent fake ID for admin
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
          email_verified: true
        };

        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        console.log('Logged in as demo admin:', adminUser);
        return adminUser;
      }

      // Demo regular user bypass for development
      if (email === 'user@example.com' && password === 'user') {
        const regularUser: User = {
          id: 'user-id', // Use a consistent fake ID for user
          name: 'Regular User',
          email: 'user@example.com',
          role: 'USER',
          email_verified: true
        };

        localStorage.setItem('currentUser', JSON.stringify(regularUser));
        console.log('Logged in as demo user:', regularUser);
        return regularUser;
      }

      // Real authentication with Firebase
      const { user } = await signIn(email, password);

      if (!user) {
        throw new Error('Login failed');
      }

      const userData: User = {
        id: user.id,
        name: user.name,
        email: user.email as string,
        role: (user.role as UserRole) || 'USER',
        email_verified: user.email_verified // Use Firebase's email verification status
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      console.log('Logged in user from Firebase:', userData);
      return userData;
    } catch (error: any) {
      // Special handling for unverified email
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        throw new Error('Please verify your email address before logging in');
      }
      throw error;
    }
  }

  // Register with Firebase
  async register(name: string, email: string, password: string): Promise<{ user: any; verificationToken: string | null }> {
    // Demo users bypass for development
    if (email === 'admin@example.com' || email === 'user@example.com') {
      throw new Error('This email is already in use');
    }

    const result = await signUp(email, password, name);

    if (!result.user) {
      throw new Error('Registration failed');
    }

    console.log('Registered new user:', result.user);

    // Auto-verify users in development
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('Development mode: Auto-verifying user');

        // Update the user to mark them as verified
        const { error } = await fetch('/api/auth/auto-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: result.user.id, email }),
        }).then(r => r.json());

        if (error) {
          console.warn('Warning: Could not auto-verify user:', error);
        } else {
          console.log('User auto-verified successfully');

          // Show verification token for testing
          if (result.verificationToken) {
            console.log('Verification token (for reference only):', result.verificationToken);
          }

          // Return with clear indicator that user is verified
          return {
            user: { ...result.user, email_verified: true },
            verificationToken: null // No need for token since verified
          };
        }
      } catch (verifyErr) {
        console.warn('Error during auto-verification:', verifyErr);
        // Continue with normal flow if auto-verify fails
      }
    }

    // Return the verification token - DO NOT store in localStorage
    return {
      user: result.user,
      verificationToken: result.verificationToken
    };
  }

  // Logout from Firebase
  async logout(): Promise<void> {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      // Clear user data and chat data
      localStorage.removeItem('currentUser');
      clearChatLocalStorage();
    }
  }

  // Refresh user data from server
  async refreshUserData(): Promise<User | null> {
    try {
      const userData = await getCurrentUser();

      if (!userData) {
        localStorage.removeItem('currentUser');
        clearChatLocalStorage();
        return null;
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        email_verified: userData.email_verified
      };

      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  }
}

// Create singleton instance
const authStore = new AuthStore();
export default authStore;
