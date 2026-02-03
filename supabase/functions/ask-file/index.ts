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
    const supabaseClient = createClient(
      Deno.env.get("LOCAL_SUPABASE_URL") ?? "",
      Deno.env.get("LOCAL_SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {},
        },
      },
    );

    // 2. Buscar o content correspondente no banco de dados
    const { data: file, error: dbError } = await supabaseClient
      .from("files")
      .select("raw_content")
      .eq("id", file_id)
      .single();

    if (dbError || !file) {
      console.error("Database error:", dbError);
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

    // 3. Montar o prompt usando content e question
    const prompt =
      `Você é um assistente especializado em análise de documentos. Sua tarefa é responder à pergunta fornecida baseando-se **EXCLUSIVAMENTE** no texto de contexto abaixo.

**Regras estritas:**
1. Use apenas as informações presentes no texto fornecido. Não utilize conhecimento externo ou fatos que não estejam explicitamente mencionados.
2. Se a resposta para a pergunta não puder ser encontrada no texto, você deve responder exatamente: "Não sei" ou informar que a informação não está presente no documento.
3. Mantenha a resposta objetiva e diretamente relacionada ao que foi perguntado.

**Texto de Contexto:**
${file.raw_content}

**Pergunta:**
${question}

**Resposta:**`;

    // 4. Chamar um modelo de linguagem real (ex: OpenAI)
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 500,
        },
      );
    }

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Or whichever model you prefer
          messages: [
            {
              role: "system",
              content:
                "Você é um assistente útil que responde perguntas com base em documentos.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0,
        }),
      },
    );

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error("OpenAI error:", errorData);
      return new Response(
        JSON.stringify({
          error: "Error calling AI model",
          details: errorData,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 502,
        },
      );
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices[0].message.content;

    // 5. Retornar a resposta como JSON
    return new Response(JSON.stringify({ answer }), {
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
