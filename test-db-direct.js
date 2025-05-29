#!/usr/bin/env bun

// Test script for Supabase database operations
// Run this directly with: bun test-db-direct.js
import { createClient } from '@supabase/supabase-js';

// Database configuration
const supabaseUrl = 'https://uxykngbifvftpnkuhqce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eWtuZ2JpZnZmdHBua3VocWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjc4OTMzNCwiZXhwIjoyMDU4MzY1MzM0fQ.Mn0RyDcoRs0m2rtj7VBgubwekIwT8TgaEEFfA_4Borw';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate a valid UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Main test function
async function runDatabaseTest() {
  console.log('🔍 Testing Supabase database connection and operations...');

  // 1. Test database connection
  try {
    const { data, error } = await supabase.from('chat_sessions').select('count').limit(1);

    if (error) {
      console.error('❌ Database connection test failed:', error);
    } else {
      console.log('✅ Database connection successful');
    }
  } catch (err) {
    console.error('❌ Database connection exception:', err);
  }

  // 2. Test authentication status
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('❌ Auth test failed:', authError);
    } else if (authData && authData.session) {
      console.log('✅ Authenticated as:', authData.session.user.email);
    } else {
      console.log('⚠️ Not authenticated with Supabase (This is expected with service role key)');
    }
  } catch (err) {
    console.error('❌ Auth test exception:', err);
  }

  // 3. Test if chat_sessions table exists
  try {
    const { data, error } = await supabase.from('chat_sessions').select('*').limit(1);

    if (error && error.code === '42P01') {
      console.error('❌ chat_sessions table does not exist');

      // Create the table
      console.log('🔄 Creating chat_sessions table...');
      const { error: createError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.chat_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          title TEXT NOT NULL DEFAULT 'New Chat',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      if (createError) {
        console.error('❌ Failed to create chat_sessions table:', createError);
      } else {
        console.log('✅ chat_sessions table created');
      }
    } else if (error) {
      console.error('❌ Error checking chat_sessions table:', error);
    } else {
      console.log('✅ chat_sessions table exists with', data.length, 'rows');
    }
  } catch (err) {
    console.error('❌ chat_sessions test exception:', err);
  }

  // 4. Test if messages table exists
  try {
    const { data, error } = await supabase.from('messages').select('*').limit(1);

    if (error && error.code === '42P01') {
      console.error('❌ messages table does not exist');

      // Create the table
      console.log('🔄 Creating messages table...');
      const { error: createError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages (session_id);
      `);

      if (createError) {
        console.error('❌ Failed to create messages table:', createError);
      } else {
        console.log('✅ messages table created');
      }
    } else if (error) {
      console.error('❌ Error checking messages table:', error);
    } else {
      console.log('✅ messages table exists with', data.length, 'rows');
    }
  } catch (err) {
    console.error('❌ messages test exception:', err);
  }

  // 5. Test creating a chat session
  const testUserId = generateUUID(); // Generate a valid UUID
  try {
    console.log('🔄 Creating test chat session with user ID:', testUserId);
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: testUserId,
        title: 'Test Session ' + new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create test chat session:', error);
      return;
    }

    console.log('✅ Created test chat session:', data.id);

    // 6. Test adding a message to the session
    try {
      console.log('🔄 Adding test message to session:', data.id);
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          session_id: data.id,
          role: 'user',
          content: 'This is a test message sent at ' + new Date().toISOString()
        })
        .select()
        .single();

      if (messageError) {
        console.error('❌ Failed to add test message:', messageError);
      } else {
        console.log('✅ Added test message:', messageData.id);

        // 7. Test retrieving the message
        try {
          console.log('🔄 Retrieving test message...');
          const { data: retrievedData, error: retrieveError } = await supabase
            .from('messages')
            .select('*')
            .eq('id', messageData.id)
            .single();

          if (retrieveError) {
            console.error('❌ Failed to retrieve test message:', retrieveError);
          } else {
            console.log('✅ Retrieved test message:', retrievedData);
            console.log('✅ ALL TESTS PASSED! Database operations are working correctly.');
          }
        } catch (err) {
          console.error('❌ Exception retrieving message:', err);
        }
      }
    } catch (err) {
      console.error('❌ Exception adding message:', err);
    }
  } catch (err) {
    console.error('❌ Exception creating chat session:', err);
  }
}

// Run the test
runDatabaseTest();
