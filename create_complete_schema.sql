-- Complete Database Schema for DoubleAI Chat App
-- Run this in your Supabase SQL Editor to recreate your database from scratch

-- Step 1: Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,  -- Adding password column explicitly
  name TEXT,
  role TEXT DEFAULT 'USER',
  is_active BOOLEAN DEFAULT true,
  is_banned BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add basic policies for the users table
CREATE POLICY "Users can view themselves" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update themselves" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Step 2: Create the chat_sessions table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,  -- Using TEXT to avoid foreign key constraints
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for the chat_sessions table
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Simple policy to grant access
CREATE POLICY "Access own chats" ON public.chat_sessions
  FOR ALL USING (true);  -- We'll rely on application logic for now

-- Step 3: Create the messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster message retrieval
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages (session_id);

-- Enable Row Level Security for the messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Simple policy for messages
CREATE POLICY "Access messages" ON public.messages
  FOR ALL USING (true);  -- We'll rely on application logic for now

-- Step 4: Create the settings tables
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id TEXT PRIMARY KEY,
  temperature NUMERIC DEFAULT 0.7,
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for the user_settings table
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Simple policy for user settings
CREATE POLICY "Access own settings" ON public.user_settings
  FOR ALL USING (true);  -- We'll rely on application logic for now

-- Create the global settings table
CREATE TABLE IF NOT EXISTS public.global_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_model TEXT DEFAULT 'gpt-3.5-turbo',
  system_prompt TEXT DEFAULT 'You are a helpful AI assistant.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for the global_settings table
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Simple policy for global settings
CREATE POLICY "Read global settings" ON public.global_settings
  FOR SELECT USING (true);

-- Step 5: Initialize with some data

-- Create a test user
INSERT INTO public.users (id, email, password, name, role, is_active, is_banned, email_verified)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'testuser@example.com',
   '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', -- SHA-256 hash of 'password123'
   'Test User', 'USER', true, false, true)
ON CONFLICT (email) DO NOTHING;

-- Initialize global settings
INSERT INTO public.global_settings (default_model, system_prompt)
VALUES ('gpt-3.5-turbo', 'You are a helpful AI assistant.')
ON CONFLICT (id) DO NOTHING;

-- Create a test chat session for the test user
INSERT INTO public.chat_sessions (id, user_id, title)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Welcome Chat')
ON CONFLICT DO NOTHING;

-- Step 6: Create helpful functions

-- Function to add password column if it doesn't exist
CREATE OR REPLACE FUNCTION public.add_password_column()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the column already exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'password'
  ) THEN
    RETURN 'Password column already exists';
  END IF;

  -- Add the column
  ALTER TABLE public.users ADD COLUMN password TEXT;
  RETURN 'Password column added successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error adding password column: ' || SQLERRM;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.add_password_column() TO service_role;
GRANT EXECUTE ON FUNCTION public.add_password_column() TO anon;
GRANT EXECUTE ON FUNCTION public.add_password_column() TO authenticated;
