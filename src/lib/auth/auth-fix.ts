/**
 * Auth Fix - Bypasses Supabase Auth for Login
 *
 * This module provides an alternative implementation of the signIn function
 * that uses your custom API endpoint instead of Supabase Auth directly.
 *
 * To use this fix, replace the signIn import in your auth-store.ts file:
 * - Remove: import { signIn, signUp, signOut, getCurrentUser } from "@/lib/supabase";
 * - Add: import { signIn } from "@/lib/auth/auth-fix";
 *        import { signUp, signOut, getCurrentUser } from "@/lib/supabase";
 */

import { UserResponse } from "@/lib/supabase";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

/**
 * Signs in a user using the custom API endpoint instead of Supabase Auth directly
 */
export async function signIn(email: string, password: string): Promise<{ user: User }> {
  try {
    console.log(`🔄 Signing in user using API endpoint: ${email}`);

    // Special case for demo users (fallback)
    if (email === 'admin@example.com' && password === 'admin') {
      console.log('✅ Demo admin login successful');
      return {
        user: {
          id: 'admin-id',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN'
        }
      };
    }

    if (email === 'user@example.com' && password === 'user') {
      console.log('✅ Demo user login successful');
      return {
        user: {
          id: 'user-id',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'USER'
        }
      };
    }

    // Call the custom API endpoint for login
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API login error:', data);

      // Handle specific error cases based on status field
      if (data.status === "ACCOUNT_BANNED") {
        const errorMessage = data.reason
          ? `Your account has been banned: ${data.reason}`
          : "Your account has been banned. Please contact support for assistance.";
        throw new Error(errorMessage);
      }
      else if (data.status === "ACCOUNT_INACTIVE") {
        throw new Error("Your account has been deactivated. Please contact support for assistance.");
      }
      else if (data.status === "EMAIL_NOT_VERIFIED") {
        throw new Error("EMAIL_NOT_VERIFIED");
      }
      // Handle legacy error types
      else if (data.error && data.error.includes("Password not set")) {
        throw new Error("Password not set. Please reset your password.");
      }
      else {
        throw new Error(data.error || 'Login failed');
      }
    }

    console.log('✅ API login successful:', data);

    if (!data.user) {
      throw new Error('Login response missing user data');
    }

    return {
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'USER',
      }
    };
  } catch (error) {
    console.error('❌ Error in signIn (API version):', error);
    throw error;
  }
}
