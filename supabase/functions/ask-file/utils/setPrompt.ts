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
1. Não use conhecimento externo. Responda usando apenas os trechos.
2. Para perguntas casuais ou genéricas (ex.: "oi", "tudo bem?", "olá"), responda de forma natural e breve, sem citar os trechos.
3. Se a pergunta for específica e a informação não estiver nos trechos, responda: "Essa informação específica não foi encontrada no arquivo."
4. Seja objetivo e direto; não invente detalhes.
5. Se houver conflito entre trechos, aponte a inconsistência em uma frase curta.

**Trechos de Contexto:**
${context}

**Pergunta:**
${question}

**Resposta:**`;
};
