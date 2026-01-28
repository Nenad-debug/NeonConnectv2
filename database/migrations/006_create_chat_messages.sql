-- Migration: Create chat_messages table for AI Assistant
-- Stores all conversations between users and AI

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context TEXT, -- Optional context about where chat happened (profile_setup, general, etc)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- RLS Policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own messages
DROP POLICY IF EXISTS "Users can read own messages" ON public.chat_messages;
CREATE POLICY "Users can read own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own messages
DROP POLICY IF EXISTS "Users can insert own messages" ON public.chat_messages;
CREATE POLICY "Users can insert own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System can update messages (for AI responses)
DROP POLICY IF EXISTS "System can update messages" ON public.chat_messages;
CREATE POLICY "System can update messages" ON public.chat_messages
  FOR UPDATE USING (true);
