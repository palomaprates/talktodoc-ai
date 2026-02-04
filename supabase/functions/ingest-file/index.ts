import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../../constants/corsHeaders.ts";
import { normalizeText } from "./utils/normalizeText.ts";
import { chunkText } from "./utils/chunkText.ts";
import pdf from "npm:pdf-parse@1.1.1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...corsHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const supabaseClient = createClient(
      Deno.env.get("LOCAL_SUPABASE_URL") ?? "",
      Deno.env.get("LOCAL_SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    // Get the user from the auth token
    const { data: { user }, error: userError } = await supabaseClient.auth
      .getUser();
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { fileName, fileType, content } = await req.json();

    if (!fileName || !content) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: fileName or content",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    let rawText = "";

    const byteCharacters = atob(content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        const pdfData = await pdf(byteArray);
        rawText = pdfData.text;
      } catch (err) {
        console.error("PDF parsing error:", err);
        throw new Error("Failed to parse PDF file");
      }
    } else {
      // Properly decode UTF-8 from base64
      rawText = new TextDecoder().decode(byteArray);
    }

    if (!rawText || rawText.trim().length === 0) {
      throw new Error("Extracted text is empty");
    }

    const cleanText = normalizeText(rawText);
    const chunks = chunkText(cleanText, 100, 200, 0.1);

    // 1. Create a Chat
    const { data: chat, error: chatError } = await supabaseClient
      .from("chats")
      .insert({
        user_id: user.id,
        title: fileName,
      })
      .select()
      .single();

    if (chatError) throw chatError;

    // 2. Create a File record
    const { data: fileEntity, error: fileError } = await supabaseClient
      .from("files")
      .insert({
        chat_id: chat.id,
        original_name: fileName,
        file_type: fileType ||
          (fileName.endsWith(".pdf") ? "application/pdf" : "text/plain"),
        raw_content: rawText,
        clean_content: cleanText,
      })
      .select()
      .single();

    if (fileError) throw fileError;

    // 3. Create Chunks
    if (chunks.length > 0) {
      const chunksToInsert = chunks.map((content, index) => ({
        file_id: fileEntity.id,
        chat_id: chat.id,
        content: content,
        chunk_index: index,
      }));

      const { error: chunkError } = await supabaseClient
        .from("chunks")
        .insert(chunksToInsert);

      if (chunkError) throw chunkError;
    }

    return new Response(
      JSON.stringify({
        chat_id: chat.id,
        file_id: fileEntity.id,
        chunks_count: chunks.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Ingestion error:", errorMessage);
    return new Response(
      JSON.stringify({
        error: "Erro ao processar o arquivo",
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
