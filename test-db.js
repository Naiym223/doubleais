// Test script for Supabase database operations
import { createClient } from '@supabase/supabase-js';

// Database configuration
const supabaseUrl = 'https://uxykngbifvftpnkuhqce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eWtuZ2JpZnZmdHBua3VocWNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjc4OTMzNCwiZXhwIjoyMDU4MzY1MzM0fQ.Mn0RyDcoRs0m2rtj7VBgubwekIwT8TgaEEFfA_4Borw';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test function to list all tables
async function listTables() {
  console.log('🔍 Listing all tables in the database...');

  try {
    const { data, error } = await supabase.rpc('list_tables');

    if (error) {
      console.error('❌ Error listing tables:', error);
      return;
    }

    console.log('✅ Tables in database:', data);
  } catch (err) {
    console.error('❌ Exception listing tables:', err);
  }
}

// Test function to check if the chat_sessions table exists and has the right structure
async function checkChatSessionsTable() {
  console.log('🔍 Checking chat_sessions table...');

  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing chat_sessions table:', error);
      return false;
    }

    console.log('✅ chat_sessions table exists');
    return true;
  } catch (err) {
    console.error('❌ Exception checking chat_sessions table:', err);
    return false;
  }
}

// Test function to check if the messages table exists and has the right structure
async function checkMessagesTable() {
  console.log('🔍 Checking messages table...');

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error accessing messages table:', error);
      return false;
    }

    console.log('✅ messages table exists');
    return true;
  } catch (err) {
    console.error('❌ Exception checking messages table:', err);
    return false;
  }
}

// Test function to create a chat session
async function createChatSession(userId) {
  console.log(`🔍 Creating test chat session for user: ${userId}`);

  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: 'Test Chat Session',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating chat session:', error);
      return null;
    }

    console.log('✅ Created chat session:', data);
    return data;
  } catch (err) {
    console.error('❌ Exception creating chat session:', err);
    return null;
  }
}

// Test function to add a message to a chat session
async function addMessage(sessionId, role, content) {
  console.log(`🔍 Adding test message to session: ${sessionId}`);

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding message:', error);
      return null;
    }

    console.log('✅ Added message:', data);
    return data;
  } catch (err) {
    console.error('❌ Exception adding message:', err);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting database tests...');

  // Generate a test user ID (normally this would be from auth)
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';

  // Check tables
  const hasSessionsTable = await checkChatSessionsTable();
  const hasMessagesTable = await checkMessagesTable();

  if (!hasSessionsTable || !hasMessagesTable) {
    console.log('❌ Missing required tables. Creating tables...');

    // Create tables
    await createTables();

    // Check again
    const sessionTableCreated = await checkChatSessionsTable();
    const messagesTableCreated = await checkMessagesTable();

    if (!sessionTableCreated || !messagesTableCreated) {
      console.error('❌ Failed to create tables. Aborting tests.');
      return;
    }
  }

  // Create a test chat session
  const session = await createChatSession(testUserId);
  if (!session) {
    console.error('❌ Failed to create chat session. Aborting tests.');
    return;
  }

  // Add a test message
  const message = await addMessage(session.id, 'user', 'This is a test message');
  if (!message) {
    console.error('❌ Failed to add message.');
    return;
  }

  console.log('✅ All tests completed successfully!');
}

// Function to create the required tables
async function createTables() {
  try {
    console.log('🔍 Creating necessary tables...');

    // Create chat_sessions table
    const { error: sessionError } = await supabase.rpc('create_chat_sessions_table');
    if (sessionError) {
      console.error('❌ Error creating chat_sessions table:', sessionError);

      // Try direct SQL
      const { error: sqlError } = await supabase.sql(`
        CREATE TABLE IF NOT EXISTS public.chat_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          title TEXT NOT NULL DEFAULT 'New Chat',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      if (sqlError) {
        console.error('❌ Error executing SQL to create chat_sessions table:', sqlError);
      } else {
        console.log('✅ chat_sessions table created via SQL');
      }
    } else {
      console.log('✅ chat_sessions table created');
    }

    // Create messages table
    const { error: messagesError } = await supabase.rpc('create_messages_table');
    if (messagesError) {
      console.error('❌ Error creating messages table:', messagesError);

      // Try direct SQL
      const { error: sqlError } = await supabase.sql(`
        CREATE TABLE IF NOT EXISTS public.messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages (session_id);
      `);

      if (sqlError) {
        console.error('❌ Error executing SQL to create messages table:', sqlError);
      } else {
        console.log('✅ messages table created via SQL');
      }
    } else {
      console.log('✅ messages table created');
    }
  } catch (err) {
    console.error('❌ Exception creating tables:', err);
  }
}

// Run all tests
runTests();
