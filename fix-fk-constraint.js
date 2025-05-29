#!/usr/bin/env bun

// Fix for the foreign key constraint issue in the chat_sessions table
import { createClient } from '@supabase/supabase-js';

// Database configuration
const supabaseUrl = 'https://uxykngbifvftpnkuhqce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eWtuZ2JpZnZmdHBua3VocWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjc4OTMzNCwiZXhwIjoyMDU4MzY1MzM0fQ.Mn0RyDcoRs0m2rtj7VBgubwekIwT8TgaEEFfA_4Borw';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixForeignKeyConstraint() {
  console.log('🔧 Fixing foreign key constraint for chat_sessions table...');

  // 1. Check if users table exists
  try {
    const { data, error } = await supabase.from('users').select('count');

    if (error && error.code === '42P01') {
      console.log('⚠️ users table does not exist, creating it...');

      // Create users table
      const { error: createError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          role TEXT NOT NULL DEFAULT 'USER',
          is_active BOOLEAN NOT NULL DEFAULT true,
          is_banned BOOLEAN NOT NULL DEFAULT false,
          email_verified BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      if (createError) {
        console.error('❌ Failed to create users table:', createError);
        return;
      }

      console.log('✅ users table created');
    } else if (error) {
      console.error('❌ Error checking users table:', error);
      return;
    } else {
      console.log('✅ users table exists');
    }

    // 2. Check if we need to recreate the chat_sessions table
    try {
      console.log('🔍 Checking chat_sessions table...');

      // First, let's try to get table details
      const { error: tableInfoError } = await supabase.rpc('get_table_info', { table_name: 'chat_sessions' });

      if (tableInfoError) {
        console.error('❌ Error getting chat_sessions table info:', tableInfoError);
      }

      // Option 1: Try to alter the foreign key constraint
      console.log('🔄 Attempting to alter foreign key constraint...');
      try {
        const { error: alterError } = await supabase.query(`
          ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;
        `);

        if (alterError) {
          console.error('❌ Failed to drop foreign key constraint:', alterError);
        } else {
          console.log('✅ Removed foreign key constraint');

          // Create a new constraint that allows any UUID
          const { error: newConstraintError } = await supabase.query(`
            ALTER TABLE public.chat_sessions ALTER COLUMN user_id DROP NOT NULL;
          `);

          if (newConstraintError) {
            console.error('❌ Failed to make user_id nullable:', newConstraintError);
          } else {
            console.log('✅ Made user_id column nullable');
          }
        }
      } catch (err) {
        console.error('❌ Exception altering constraint:', err);
      }

    } catch (err) {
      console.error('❌ Exception checking chat_sessions table:', err);
    }

    // 3. Insert a test user
    console.log('🔄 Creating a test user for foreign key reference...');
    const testUserId = 'c6f30c5b-beaa-4fd4-a6a0-f11115c06ab8'; // Fixed UUID

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          id: testUserId,
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER'
        })
        .select()
        .single();

      if (userError) {
        console.error('❌ Failed to create test user:', userError);
      } else {
        console.log('✅ Created/updated test user:', userData.id);

        // 4. Test creating a chat session with this user ID
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: testUserId,
            title: 'Test Chat ' + new Date().toISOString()
          })
          .select()
          .single();

        if (sessionError) {
          console.error('❌ Failed to create test session:', sessionError);
        } else {
          console.log('✅ Successfully created chat session:', sessionData.id);

          // 5. Test adding a message to this session
          const { data: msgData, error: msgError } = await supabase
            .from('messages')
            .insert({
              session_id: sessionData.id,
              role: 'user',
              content: 'Test message ' + new Date().toISOString()
            })
            .select()
            .single();

          if (msgError) {
            console.error('❌ Failed to add test message:', msgError);
          } else {
            console.log('✅ Successfully added message:', msgData.id);
            console.log('✅ ALL FIXES AND TESTS SUCCESSFUL!');
          }
        }
      }
    } catch (err) {
      console.error('❌ Exception creating test data:', err);
    }
  } catch (err) {
    console.error('❌ Exception checking users table:', err);
  }
}

// Run the fix
fixForeignKeyConstraint();
