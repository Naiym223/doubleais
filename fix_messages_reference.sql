-- Fix the foreign key issue with the messages table

-- First drop the messages table if it exists
DROP TABLE IF EXISTS public.messages;

-- Recreate the messages table with proper foreign key constraint
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster message retrieval
CREATE INDEX IF NOT EXISTS messages_session_id_idx ON public.messages (session_id);

-- RLS Policy for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create non-recursive policies for messages
CREATE POLICY "User message access" ON public.messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()
    )
  );
