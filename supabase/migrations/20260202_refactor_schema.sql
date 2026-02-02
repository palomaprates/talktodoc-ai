-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the files table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    clean_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the chunks table
CREATE TABLE IF NOT EXISTS public.chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    chunk_index INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the summaries table
CREATE TABLE IF NOT EXISTS public.summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    content_md TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.chats ENABLE CONTROL;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chats" ON public.chats
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage messages in their own chats" ON public.messages
    FOR ALL USING (EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage files in their own chats" ON public.files
    FOR ALL USING (EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage chunks in their own chats" ON public.chunks
    FOR ALL USING (EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage summaries in their own chats" ON public.summaries
    FOR ALL USING (EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND user_id = auth.uid()));
