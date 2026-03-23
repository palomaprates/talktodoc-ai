-- Update semantic search function to match by chat and optional similarity threshold
DROP FUNCTION IF EXISTS public.match_chunks(VECTOR(768), INT, UUID);

CREATE OR REPLACE FUNCTION public.match_chunks(
    query_embedding VECTOR(768),
    match_count INT,
    match_chat_id UUID,
    match_threshold FLOAT DEFAULT 0.2
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
    WHERE c.chat_id = match_chat_id
      AND c.embedding IS NOT NULL
      AND (1 - (c.embedding <=> query_embedding)) >= match_threshold
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
$$;
