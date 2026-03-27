import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const createAuthedClient = (authHeader: string | null) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
};

export const resolveChatIdFromFile = async (
  file_id: string,
  authHeader: string | null,
): Promise<string | null> => {
  const supabaseClient = createAuthedClient(authHeader);

  const { data: file, error: dbError } = await supabaseClient
    .from("files")
    .select("id, chat_id")
    .eq("id", file_id)
    .single();

  if (dbError || !file) {
    console.error("Database error:", dbError);
    return null;
  }

  return file.chat_id as string;
};

export const getRelevantChunks = async (
  chat_id: string,
  queryEmbedding: number[],
  authHeader: string | null,
  matchCount: number = 5,
  matchThreshold: number = 0.2,
) => {
  const supabaseClient = createAuthedClient(authHeader);

  const { data: chunks, error: chunkError } = await supabaseClient.rpc(
    "match_chunks",
    {
      query_embedding: `[${queryEmbedding.join(",")}]`,
      match_threshold: matchThreshold,
      match_count: matchCount,
      match_chat_id: chat_id,
    },
  );

  if (chunkError) {
    console.error("Chunk search error:", chunkError);
    throw new Error(`Chunk search error: ${chunkError.message ?? "unknown"}`);
  }

  return chunks;
};
