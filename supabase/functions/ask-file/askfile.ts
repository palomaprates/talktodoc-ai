import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export const getRelevantChunks = async (
  file_id: string,
  queryEmbedding: number[],
  authHeader: string | null,
  matchCount: number = 5,
  matchThreshold: number = 0.2,
) => {
  const supabaseUrl = Deno.env.get("LOCAL_SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("LOCAL_SUPABASE_ANON_KEY") ?? "";

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });

  const { data: file, error: dbError } = await supabaseClient
    .from("files")
    .select("id, chat_id")
    .eq("id", file_id)
    .single();

  if (dbError || !file) {
    console.error("Database error:", dbError);
    return null;
  }

  const { data: chunks, error: chunkError } = await supabaseClient.rpc(
    "match_chunks",
    {
      query_embedding: `[${queryEmbedding.join(",")}]`,
      match_threshold: matchThreshold,
      match_count: matchCount,
      p_chat_id: file.chat_id,
    },
  );

  if (chunkError) {
    console.error("Chunk search error:", chunkError);
    return null;
  }

  return chunks;
};
