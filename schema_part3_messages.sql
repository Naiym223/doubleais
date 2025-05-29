-- Part 3: Messages Table and Policies

-- Messages Table
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

-- Policies for access control
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = messages.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their own chat sessions" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = messages.session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
