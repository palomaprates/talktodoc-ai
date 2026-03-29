import { corsHeaders } from "../../constants/corsHeaders.ts";
import { getRelevantChunks, resolveChatIdFromFile } from "./askfile.ts";
import { setPrompt } from "./utils/setPrompt.ts";
import { askAI } from "./utils/askAI.ts";
import { embedTexts } from "../utils/geminiEmbeddings.ts";

const encoder = new TextEncoder();

function sseResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
    status: 200,
  });
}

function sendEvent(controller: ReadableStreamDefaultController<Uint8Array>, data: string) {
  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
}

async function streamText(
  controller: ReadableStreamDefaultController<Uint8Array>,
  text: string,
) {
  const parts = text.split(/(\s+)/).filter((part) => part.length > 0);
  for (const part of parts) {
    sendEvent(controller, JSON.stringify({ token: part }));
    await new Promise((resolve) => setTimeout(resolve, 12));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { chat_id, file_id, question } = await req.json();

    if (!question || (!chat_id && !file_id)) {
      return new Response(
        JSON.stringify({ error: "Missing chat_id (or file_id) or question" }),
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

    const resolvedChatId = chat_id ||
      (file_id ? await resolveChatIdFromFile(file_id, authHeader) : null);

    if (!resolvedChatId) {
      return new Response(
        JSON.stringify({ error: "Unable to resolve chat_id" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 404,
        },
      );
    }

    const [queryEmbedding] = await embedTexts(
      [question],
      "RETRIEVAL_QUERY",
      768,
    );

    const chunks = await getRelevantChunks(
      resolvedChatId,
      queryEmbedding,
      authHeader,
      5,
      0.0,
    );

    const stream = new ReadableStream<Uint8Array>({
      start: async (controller) => {
        try {
          const safeChunks = Array.isArray(chunks) ? chunks : [];
          const prompt = setPrompt(safeChunks, question);
          const aiResponse = await askAI(prompt);

          await streamText(controller, aiResponse);
          sendEvent(controller, "[DONE]");
          controller.close();
        } catch (err) {
          const errorMessage = err instanceof Error
            ? err.message
            : (typeof err === "object" ? JSON.stringify(err) : String(err));
          console.error("Function error:", errorMessage);
          sendEvent(controller, JSON.stringify({ error: errorMessage }));
          sendEvent(controller, "[DONE]");
          controller.close();
        }
      },
    });

    return sseResponse(stream);
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
