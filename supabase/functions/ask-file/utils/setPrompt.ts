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
  Be objective and direct; do not invent details.
  If there is a conflict between excerpts, point out the inconsistency in one short sentence.
  The answer must be in the same language as the question.
  Always match the question's language exactly. If the question is in English, answer in English. If in Portuguese, answer in Portuguese.
  
  Context Excerpts:
  ${context}

  Question:
  ${question}

  Answer:`;
};
