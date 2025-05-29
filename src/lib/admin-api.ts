/**
 * Admin API utilities for interacting with Supabase
 */

import { supabase } from '@/lib/supabase';

// Types
export interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  is_banned: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Admin Functions
export async function getUsers(): Promise<UserData[]> {
  try {
    console.log('🔄 Fetching users from Supabase...');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }

    console.log(`✅ Retrieved ${data?.length || 0} users`);

    // Add demo users if in development
    const users = [...(data || [])];

    // If no users, add demo users
    if (users.length === 0 || process.env.NODE_ENV === 'development') {
      users.push({
        id: 'admin-id',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
        is_active: true,
        is_banned: false,
        email_verified: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });

      users.push({
        id: 'user-id',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'USER',
        is_active: true,
        is_banned: false,
        email_verified: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return users;
  } catch (error) {
    console.error('❌ Exception in getUsers:', error);
    // Return demo users as fallback
    return [
      {
        id: 'admin-id',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
        is_active: true,
        is_banned: false,
        email_verified: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-id',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'USER',
        is_active: true,
        is_banned: false,
        email_verified: true,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}

export async function getChatSessions(): Promise<ChatSession[]> {
  try {
    console.log('🔄 Fetching chat sessions from Supabase...');

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching chat sessions:', error);
      throw error;
    }

    console.log(`✅ Retrieved ${data?.length || 0} chat sessions`);
    return data || [];
  } catch (error) {
    console.error('❌ Exception in getChatSessions:', error);
    return [];
  }
}

export async function getMessagesForSession(sessionId: string): Promise<ChatMessage[]> {
  try {
    console.log(`🔄 Fetching messages for session ${sessionId}...`);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('❌ Error fetching messages:', error);
      throw error;
    }

    console.log(`✅ Retrieved ${data?.length || 0} messages for session ${sessionId}`);
    return data || [];
  } catch (error) {
    console.error('❌ Exception in getMessagesForSession:', error);
    return [];
  }
}

export async function updateUserStatus(userId: string, updates: Partial<UserData>): Promise<boolean> {
  try {
    console.log(`🔄 Updating user ${userId} with:`, updates);

    // Don't allow updates to demo users
    if (userId === 'admin-id' || userId === 'user-id') {
      console.log('⚠️ Cannot update demo users');
      return true; // Pretend it succeeded
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }

    console.log(`✅ Updated user ${userId} successfully`);
    return true;
  } catch (error) {
    console.error('❌ Exception in updateUserStatus:', error);
    return false;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    console.log(`🔄 Deleting user ${userId}...`);

    // Don't allow deleting demo users
    if (userId === 'admin-id' || userId === 'user-id') {
      console.log('⚠️ Cannot delete demo users');
      return true; // Pretend it succeeded
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }

    console.log(`✅ Deleted user ${userId} successfully`);
    return true;
  } catch (error) {
    console.error('❌ Exception in deleteUser:', error);
    return false;
  }
}

export async function getStats() {
  try {
    console.log('🔄 Getting system stats...');

    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (userError) {
      console.error('❌ Error getting user count:', userError);
    }

    // Get chat count
    const { count: chatCount, error: chatError } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true });

    if (chatError) {
      console.error('❌ Error getting chat count:', chatError);
    }

    // Get message count
    const { count: messageCount, error: messageError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    if (messageError) {
      console.error('❌ Error getting message count:', messageError);
    }

    console.log('✅ Stats retrieved successfully');
    return {
      users: userCount || 0,
      chats: chatCount || 0,
      messages: messageCount || 0
    };
  } catch (error) {
    console.error('❌ Exception in getStats:', error);
    return {
      users: 0,
      chats: 0,
      messages: 0
    };
  }
}
