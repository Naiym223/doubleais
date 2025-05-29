-- Comprehensive fix for Supabase database issues
-- This script fixes infinite recursion in policies and creates all missing tables

-- Step 1: Fix infinite recursion in users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admin access" ON public.users;

-- Create simplified policies that won't cause recursion
CREATE POLICY "Users can view themselves" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update themselves" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Step 2: Create the missing tables

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for messages
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages (session_id);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Simple policy for messages
CREATE POLICY "Select messages" ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Insert messages" ON public.messages FOR INSERT
  WITH CHECK (true);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY,
  temperature NUMERIC DEFAULT 0.7,
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Simple policy for user_settings
CREATE POLICY "Access own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create global_settings table
CREATE TABLE IF NOT EXISTS public.global_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_model TEXT DEFAULT 'gpt-3.5-turbo',
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for global_settings
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Simple policy for global_settings
CREATE POLICY "Read global settings" ON public.global_settings
  FOR SELECT USING (true);

-- Initialize global settings
INSERT INTO public.global_settings (default_model, system_prompt)
VALUES ('gpt-3.5-turbo', 'You are a helpful AI assistant.')
ON CONFLICT (id) DO NOTHING;
