import { corsHeaders } from "../../constants/corsHeaders.ts";
import { askFile } from "./askfile.ts";
import { setPrompt } from "./utils/setPrompt.ts";
import { askAI } from "./utils/askAI.ts";

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
    const file = await askFile(file_id, authHeader);
    if (!file) {
      return new Response(
        JSON.stringify({ error: "File not found or database error" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 404,
        },
      );
    }
    const prompt = setPrompt(file, question);
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
