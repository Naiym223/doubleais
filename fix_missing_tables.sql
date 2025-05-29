-- Quick fix for missing user_settings and global_settings tables

-- User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  temperature NUMERIC DEFAULT 0.7,
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for user_settings table
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Basic policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Global Settings Table
CREATE TABLE IF NOT EXISTS public.global_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensure only one row
  default_model TEXT DEFAULT 'gpt-3.5-turbo',
  system_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for global_settings table
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Basic policies for global_settings
CREATE POLICY "Anyone can view global settings" ON public.global_settings
  FOR SELECT USING (true);

-- Initialize global settings with default values
INSERT INTO public.global_settings (default_model, system_prompt)
VALUES ('gpt-3.5-turbo', 'You are a helpful AI assistant.')
ON CONFLICT (id) DO NOTHING;
