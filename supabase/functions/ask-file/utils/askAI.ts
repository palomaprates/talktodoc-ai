export const askAI = async (prompt: string) => {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY is not configured");
    throw new Error("AI configuration error: Missing Gemini API Key");
  }

  const aiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
        },
      }),
    },
  );

  if (!aiResponse.ok) {
    const errorData = await aiResponse.json();
    console.error("Gemini error:", errorData);
    throw new Error(`Error calling Gemini: ${JSON.stringify(errorData)}`);
  }

  const aiData = await aiResponse.json();

  if (!aiData.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error("Unexpected Gemini response structure:", aiData);
    throw new Error("Invalid response from AI model");
  }

  return aiData.candidates[0].content.parts[0].text;
};
