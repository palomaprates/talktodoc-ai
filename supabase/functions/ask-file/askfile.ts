import { createClient } from "@supabase/supabase-js";

export const askFile = async (file_id: string, authHeader: string | null) => {
  const supabaseUrl = Deno.env.get("LOCAL_SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("LOCAL_SUPABASE_ANON_KEY") ?? "";

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });

  const { data: file, error: dbError } = await supabaseClient
    .from("files")
    .select("raw_content")
    .eq("id", file_id)
    .single();

  if (dbError || !file) {
    console.error("Database error:", dbError);
    return null;
  }

  return file;
};
