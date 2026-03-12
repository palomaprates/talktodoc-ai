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

  return `Você é um assistente especializado em análise de documentos.
Responda à pergunta usando **somente** os trechos de contexto abaixo.

**Regras estritas:**
1. Não use conhecimento externo. Se a informação não estiver nos trechos, responda exatamente: "Não sei".
2. Seja objetivo e direto; não invente detalhes.
3. Se houver conflito entre trechos, aponte a inconsistência em uma frase curta.

**Trechos de Contexto:**
${context}

**Pergunta:**
${question}

**Resposta:**`;
};
