import { supabase } from '@/lib/supabase';
import { createHash } from 'crypto';

// Types for the repository
interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
  role: 'ADMIN' | 'USER';
  is_active: boolean;
  is_banned: boolean;
  email_verified: boolean;
}

interface UserCredentials {
  email: string;
  password: string;
}

/**
 * User repository to handle user data operations
 */
export const userRepo = {
  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  },

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  },

  /**
   * Create a new user
   */
  async create(user: Partial<User>): Promise<User | null> {
    try {
      // Hash the password if provided
      let userData = { ...user };
      if (userData.password) {
        userData.password = hashPassword(userData.password);
      }

      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error || !data) {
        console.error('Error creating user:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  /**
   * Update a user
   */
  async update(id: string, user: Partial<User>): Promise<User | null> {
    try {
      // Hash the password if provided
      let userData = { ...user };
      if (userData.password) {
        userData.password = hashPassword(userData.password);
      }

      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.error('Error updating user:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  },

  /**
   * Verify user credentials
   */
  async verifyCredentials(credentials: UserCredentials): Promise<User | null> {
    try {
      // Special case for demo users
      if (credentials.email === 'admin@example.com' && credentials.password === 'admin') {
        return {
          id: 'admin-id',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'ADMIN',
          is_active: true,
          is_banned: false,
          email_verified: true
        };
      }

      if (credentials.email === 'user@example.com' && credentials.password === 'user') {
        return {
          id: 'user-id',
          email: 'user@example.com',
          name: 'Regular User',
          role: 'USER',
          is_active: true,
          is_banned: false,
          email_verified: true
        };
      }

      // Find user by email
      const user = await this.findByEmail(credentials.email);

      if (!user) {
        return null;
      }

      // Check if password matches
      const hashedPassword = hashPassword(credentials.password);
      if (user.password !== hashedPassword) {
        return null;
      }

      // Check if user is active and not banned
      if (!user.is_active || user.is_banned) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return null;
    }
  },

  /**
   * List all users
   */
  async list(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error listing users:', error);
        return [];
      }

      return data as User[];
    } catch (error) {
      console.error('Error listing users:', error);
      return [];
    }
  },

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
};

/**
 * Hash a password using SHA-256
 */
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}
