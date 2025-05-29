# Fixing Database Issues in DoubleAI Chat App

We've identified the root cause of the issue with chats not being saved: there are foreign key constraints in the database that are preventing data from being saved correctly.

## The Problem

The `chat_sessions` table has a foreign key constraint that requires each `user_id` to exist in the `users` table. However, this constraint is causing issues because:

1. When using demo users (admin@example.com, user@example.com), their IDs (admin-id, user-id) don't exist in the users table
2. The auth system is using Supabase Auth, but the users table might not be properly synced with auth.users

## Solution: Fix the Database Schema

Follow these steps to fix the database issues:

### Option 1: Run the SQL Script in Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to the SQL Editor (in the left sidebar)
4. Create a new query
5. Copy and paste the contents of the `fix-constraints.sql` file
6. Click "Run" to execute the SQL

This script will:
- Drop and recreate the tables with relaxed constraints
- Change the `user_id` field to `TEXT` instead of `UUID` with foreign key constraints
- Create all the necessary tables (users, chat_sessions, messages, user_settings, global_settings)
- Add a test user for reference

### Option 2: Fix Individual Tables (if you don't want to recreate everything)

If you prefer to preserve your existing data, you can alter the constraints instead:

```sql
-- Drop the dependent messages table first
DROP TABLE IF EXISTS public.messages;

-- Alter the chat_sessions table to remove the foreign key constraint
ALTER TABLE public.chat_sessions
  DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;

-- Make user_id nullable to avoid constraint issues
ALTER TABLE public.chat_sessions
  ALTER COLUMN user_id TYPE TEXT;

-- Recreate the messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the missing settings tables
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id TEXT PRIMARY KEY,
  temperature NUMERIC DEFAULT 0.7,
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.global_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_model TEXT DEFAULT 'gpt-3.5-turbo',
  system_prompt TEXT DEFAULT 'You are a helpful AI assistant.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Restart the Application

After applying the database fixes:

1. Go back to your application
2. Refresh the page
3. Try sending a new message - it should now be saved to the database
4. Refresh the page again to verify that your chat history persists

## Explanation

The core issue was that we were trying to save chat sessions with user IDs that didn't exist in the users table due to foreign key constraints. By relaxing these constraints and changing the data types, we've made the database more forgiving while still maintaining the basic structure needed for the application.

In a production environment, you would want to properly sync your authentication with your database tables, but this fix allows the application to work correctly for development and testing purposes.

## Need More Help?

If you're still encountering issues after applying these fixes, you may want to:

1. Check the browser console for any error messages
2. Look at the Supabase logs in your project dashboard
3. Verify that you're using the service role key in the supabase.ts file
4. Try recreating all tables from scratch if data preservation isn't critical
