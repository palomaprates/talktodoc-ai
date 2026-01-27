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

    const { fileBase64, filename, mimeType } = await req.json();
    if (!fileBase64 || !mimeType) {
      return new Response("Invalid payload", { status: 400 });
    }
    if (mimeType !== "application/pdf") {
      return new Response("Unsupported file type", { status: 415 });
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
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Mock conversion failed" }),
      { status: 500 },
    );
  }
});
