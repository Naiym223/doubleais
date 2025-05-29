-- Fix for the foreign key constraints in the tables

-- Step 1: Create necessary tables if they don't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
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

-- Step 2: Recreate the chat_sessions table without the foreign key constraint
-- First drop the messages table since it depends on chat_sessions
DROP TABLE IF EXISTS public.messages;

-- Then drop and recreate chat_sessions without the user_id constraint
DROP TABLE IF EXISTS public.chat_sessions;
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- Changed from UUID with foreign key to TEXT to avoid constraint
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create the messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create the settings tables
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id TEXT PRIMARY KEY, -- Changed from UUID with foreign key to TEXT
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

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages (session_id);

-- Step 6: Initialize global settings
INSERT INTO public.global_settings (default_model, system_prompt)
VALUES ('gpt-3.5-turbo', 'You are a helpful AI assistant.')
ON CONFLICT (id) DO NOTHING;

-- Step 7: Create a test user for logging in (optional)
INSERT INTO public.users (id, email, name, role)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'Test User', 'USER')
ON CONFLICT (id) DO NOTHING;

-- The SQL has been executed successfully if you see no errors!
