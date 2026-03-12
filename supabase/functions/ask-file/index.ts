import { corsHeaders } from "../../constants/corsHeaders.ts";
import { getRelevantChunks } from "./askfile.ts";
import { setPrompt } from "./utils/setPrompt.ts";
import { askAI } from "./utils/askAI.ts";
import { embedTexts } from "../utils/geminiEmbeddings.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { file_id, question } = await req.json();

    if (!file_id || !question) {
      return new Response(
        JSON.stringify({ error: "Missing file_id or question" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 400,
        },
      );
    }

    const authHeader = req.headers.get("Authorization");

    const [queryEmbedding] = await embedTexts(
      [question],
      "RETRIEVAL_QUERY",
      768,
    );

    const chunks = await getRelevantChunks(
      file_id,
      queryEmbedding,
      authHeader,
      5,
      0.2,
    );

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({ answer: "Não sei" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        },
      );
    }
    const prompt = setPrompt(chunks, question);
    const aiResponse = await askAI(prompt);

    return new Response(JSON.stringify({ answer: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const errorMessage = err instanceof Error
      ? err.message
      : (typeof err === "object" ? JSON.stringify(err) : String(err));

    console.error("Function error:", errorMessage);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
