type EmbedTaskType =
  | "RETRIEVAL_DOCUMENT"
  | "RETRIEVAL_QUERY"
  | "SEMANTIC_SIMILARITY"
  | "CLASSIFICATION"
  | "CLUSTERING";

const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";
const DEFAULT_OUTPUT_DIM = 768;

const normalizeModelName = (model: string) =>
  model.startsWith("models/") ? model : `models/${model}`;

export const embedTexts = async (
  texts: string[],
  taskType: EmbedTaskType,
  outputDimensionality: number = DEFAULT_OUTPUT_DIM,
) => {
  if (texts.length === 0) return [];

  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY is not configured");
    throw new Error("AI configuration error: Missing Gemini API Key");
  }

  const model = normalizeModelName(
    Deno.env.get("EMBEDDING_MODEL") ?? DEFAULT_EMBEDDING_MODEL,
  );

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${model}:batchEmbedContents?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model,
          content: {
            parts: [{ text }],
          },
          taskType,
          outputDimensionality,
        })),
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini embeddings error:", errorData);
    throw new Error(`Error calling Gemini embeddings: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const embeddings = data.embeddings ?? data?.embedding ?? [];

  if (!Array.isArray(embeddings) || embeddings.length !== texts.length) {
    console.error("Unexpected embeddings response:", data);
    throw new Error("Invalid response from embeddings model");
  }

  return embeddings.map((item: { values?: number[]; embedding?: number[] }) => {
    if (Array.isArray(item?.values)) return item.values;
    if (Array.isArray(item?.embedding)) return item.embedding;
    throw new Error("Embedding values missing in response");
  });
};
