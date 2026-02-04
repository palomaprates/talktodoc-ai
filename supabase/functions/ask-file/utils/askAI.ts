import { corsHeaders } from "../../../constants/corsHeaders.ts";

export const askAI = async (prompt: string) => {
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
        model: "gpt-4o-mini",
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

  return answer;
};
