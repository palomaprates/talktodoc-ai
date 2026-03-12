-- Ensure pgvector is available
CREATE EXTENSION IF NOT EXISTS vector;

-- Align embeddings to Gemini embedding size (768)
ALTER TABLE public.chunks
    ALTER COLUMN embedding TYPE VECTOR(768);

-- Semantic search function for chunk retrieval
CREATE OR REPLACE FUNCTION public.match_chunks(
    query_embedding VECTOR(768),
    match_count INT,
    match_file_id UUID
)
RETURNS TABLE (
    id UUID,
    file_id UUID,
    chat_id UUID,
    content TEXT,
    embedding VECTOR(768),
    chunk_index INT,
    created_at TIMESTAMPTZ,
    similarity FLOAT
)
LANGUAGE SQL
STABLE
AS $$
    SELECT
        c.id,
        c.file_id,
        c.chat_id,
        c.content,
        c.embedding,
        c.chunk_index,
        c.created_at,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM public.chunks c
    WHERE c.file_id = match_file_id
      AND c.embedding IS NOT NULL
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Optional index for faster similarity search
CREATE INDEX IF NOT EXISTS chunks_embedding_ivfflat
    ON public.chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
