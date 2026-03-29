import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../../constants/corsHeaders.ts";
import { normalizeText } from "./utils/normalizeText.ts";
import { chunkText } from "./utils/chunkText.ts";
import pdf from "npm:pdf-parse@1.1.1";
import { embedTexts } from "../utils/geminiEmbeddings.ts";

type IncomingFile = {
  fileName: string;
  fileType?: string;
  content: string;
};

function buildChatTitle(files: IncomingFile[]) {
  if (!files.length) return "New chat";
  if (files.length === 1) return files[0].fileName;
  return `${files[0].fileName} (+${files.length - 1} files)`;
}

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
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    const { data: { user }, error: userError } = await supabaseClient.auth
      .getUser();
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const payload = await req.json();
    const files: IncomingFile[] = payload.files?.length
      ? payload.files
      : payload.fileName && payload.content
      ? [{
        fileName: payload.fileName,
        fileType: payload.fileType,
        content: payload.content,
      }]
      : [];

    if (!files.length) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: files or fileName/content",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    const { data: chat, error: chatError } = await supabaseClient
      .from("chats")
      .insert({
        user_id: user.id,
        title: buildChatTitle(files),
      })
      .select()
      .single();

    if (chatError) throw chatError;

    const fileIds: string[] = [];
    let totalChunks = 0;

    for (const file of files) {
      let rawText = "";

      const byteCharacters = atob(file.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      if (file.fileType === "application/pdf" || file.fileName.endsWith(".pdf")) {
        try {
          const pdfData = await pdf(byteArray);
          rawText = pdfData.text;
        } catch (err) {
          console.error("PDF parsing error:", err);
          throw new Error("Failed to parse PDF file");
        }
      } else {

        rawText = new TextDecoder().decode(byteArray);
      }

      if (!rawText || rawText.trim().length === 0) {
        throw new Error(`Extracted text is empty for ${file.fileName}`);
      }

      const cleanText = normalizeText(rawText);
      const chunks = chunkText(cleanText, 300, 400, 0.1);

      const { data: fileEntity, error: fileError } = await supabaseClient
        .from("files")
        .insert({
          chat_id: chat.id,
          original_name: file.fileName,
          file_type: file.fileType ||
            (file.fileName.endsWith(".pdf") ? "application/pdf" : "text/plain"),
          raw_content: rawText,
          clean_content: cleanText,
        })
        .select()
        .single();

      if (fileError) throw fileError;
      fileIds.push(fileEntity.id);

      if (chunks.length > 0) {
        const chunkEmbeddings = await embedTexts(
          chunks,
          "RETRIEVAL_DOCUMENT",
          768,
        );

        const chunksToInsert = chunks.map((content, index) => ({
          file_id: fileEntity.id,
          chat_id: chat.id,
          content: content,
          embedding: `[${chunkEmbeddings[index].join(",")}]`,
          chunk_index: index,
        }));

        const { error: chunkError } = await supabaseClient
          .from("chunks")
          .insert(chunksToInsert);

        if (chunkError) throw chunkError;
        totalChunks += chunks.length;
      }
    }

    return new Response(
      JSON.stringify({
        chat_id: chat.id,
        file_ids: fileIds,
        chunks_count: totalChunks,
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
        error: "Error processing file",
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
