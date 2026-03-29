type ChunkContext = {
  content: string;
  chunk_index?: number;
};

export const setPrompt = (chunks: ChunkContext[], question: string) => {
  const context = chunks
    .map((chunk, index) =>
      `### Trecho ${chunk.chunk_index ?? index + 1}\n${chunk.content}`
    )
    .join("\n\n");

  return `You are an assistant specialized in document analysis.
  Answer the question using only the context excerpts below.

  Strict rules:

  Do not use external knowledge. Answer using only the excerpts.
  For casual or generic questions (e.g., "hi", "how are you?", "hello"), respond naturally and briefly, without citing the excerpts.
  If the question is specific and the information is not in the excerpts, respond: "This specific information was not found in the file."
  Be objective and direct; do not invent details.
  If there is a conflict between excerpts, point out the inconsistency in one short sentence.

  Context Excerpts:
  ${context}

  Question:
  ${question}

  Answer:`;
};
