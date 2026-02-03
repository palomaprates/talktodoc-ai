import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseClient = createClient(
      Deno.env.get("LOCAL_SUPABASE_URL") ?? "",
      Deno.env.get("LOCAL_SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
      },
    );

    const { title, file_type, content, chat_id } = await req.json();

    if (!title || !content || !chat_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: title, content, or chat_id",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    if (file_type !== "txt") {
      return new Response(
        JSON.stringify({
          error: "Somente arquivos 'txt' são permitidos nesta função",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    const { data, error } = await supabaseClient
      .from("files")
      .insert({
        chat_id: chat_id,
        original_name: title,
        file_type: file_type,
        raw_content: content,
        clean_content: content,
      })
      .select("id")
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ file_id: data.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    const errorMessage = err instanceof Error
      ? err.message
      : (typeof err === "object" ? JSON.stringify(err) : String(err));

    console.error("Ingestion error:", errorMessage);
    return new Response(
      JSON.stringify({
        error: "Erro interno ao processar o arquivo",
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
