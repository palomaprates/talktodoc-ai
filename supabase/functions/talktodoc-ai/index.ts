import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    const { fileBase64, filename, mimeType, action, content } = await req
      .json();

    if (action === "summarize") {
      if (!content) {
        return new Response("Content required for summarization", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const mockSummary = `
## Resumo do Documento
Este documento trata de **${
        content.substring(0, 50)
      }...** e contém informações importantes sobre o tema abordado.

### Pontos Chave
- Ponto 1: Detalhe importante extraído.
- Ponto 2: Outra observação relevante.
- Ponto 3: Conclusão do documento.
`;

      return new Response(
        JSON.stringify({ summary: mockSummary }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    if (!fileBase64 || !mimeType) {
      return new Response("Invalid payload", {
        status: 400,
        headers: corsHeaders,
      });
    }
    if (mimeType !== "application/pdf") {
      return new Response("Unsupported file type", {
        status: 415,
        headers: corsHeaders,
      });
    }
    const mockMarkdown = `
# ${filename}
 
## Extracted Content (Mock)

This is a **mocked Markdown output** simulating a PDF conversion.

- File name: \`${filename}\`
- MIME type: \`${mimeType}\`
- Conversion: **PDF → Markdown**

### Sample Section

Lorem ipsum dolor sit amet, consectetur adipiscing elit.

\`\`\`
function example() {
  return "mock content";
}
\`\`\`

---

_End of mock document._
`;
    return new Response(
      JSON.stringify({ content: mockMarkdown }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Mock conversion failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
