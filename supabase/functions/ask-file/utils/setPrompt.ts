export const setPrompt = (file: { raw_content: string }, question: string) => {
  return `Você é um assistente especializado em análise de documentos. Sua tarefa é responder à pergunta fornecida baseando-se **EXCLUSIVAMENTE** no texto de contexto abaixo.

**Regras estritas:**
1. Use apenas as informações presentes no texto fornecido. Não utilize conhecimento externo ou fatos que não estejam explicitamente mencionados.
2. Se a resposta para a pergunta não puder ser encontrada no texto, você deve responder exatamente: "Não sei" ou informar que a informação não está presente no documento.
3. Mantenha a resposta objetiva e diretamente relacionada ao que foi perguntado.

**Texto de Contexto:**
${file.raw_content}

**Pergunta:**
${question}

**Resposta:**`;
};
