const CHARS_PER_TOKEN = 4;

export function chunkText(
  text: string,
  minTokens: number = 300,
  maxTokens: number = 800,
  overlapPercent: number = 0.2,
): string[] {
  if (!text) return [];

  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const minChars = minTokens * CHARS_PER_TOKEN;
  const overlapChars = Math.floor(maxChars * overlapPercent);

  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    if (!paragraph) continue;

    if ((currentChunk + "\n\n" + paragraph).length > maxChars) {
      if (currentChunk.length >= minChars) {
        chunks.push(currentChunk.trim());

        const overlapStart = Math.max(
          0,
          currentChunk.length - overlapChars,
        );
        let actualOverlapStart = currentChunk.indexOf(
          ". ",
          overlapStart,
        );
        if (actualOverlapStart === -1) {
          actualOverlapStart = currentChunk.indexOf(
            " ",
            overlapStart,
          );
        }
        if (actualOverlapStart === -1) {
          actualOverlapStart = overlapStart;
        } else actualOverlapStart += 1;

        currentChunk = currentChunk.substring(actualOverlapStart).trim() +
          "\n\n" +
          paragraph;
      } else {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);

        for (const sentence of sentences) {
          if ((currentChunk + " " + sentence).length > maxChars) {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk.trim());

              const overlapStart = Math.max(
                0,
                currentChunk.length - overlapChars,
              );
              let actualOverlapStart = currentChunk.indexOf(
                ". ",
                overlapStart,
              );
              if (actualOverlapStart === -1) {
                actualOverlapStart = currentChunk.indexOf(
                  " ",
                  overlapStart,
                );
              }
              if (actualOverlapStart === -1) {
                actualOverlapStart = overlapStart;
              } else actualOverlapStart += 1;

              currentChunk = currentChunk.substring(
                actualOverlapStart,
              ).trim();
            }

            if (sentence.length > maxChars) {
              let remainingSentence = sentence;
              while (remainingSentence.length > maxChars) {
                chunks.push(
                  remainingSentence.substring(0, maxChars)
                    .trim(),
                );
                remainingSentence = remainingSentence.substring(
                  maxChars - overlapChars,
                ).trim();
              }
              currentChunk = (currentChunk ? currentChunk + " " : "") +
                remainingSentence;
            } else {
              currentChunk = (currentChunk ? currentChunk + " " : "") +
                sentence;
            }
          } else {
            currentChunk = (currentChunk ? currentChunk + " " : "") + sentence;
          }
        }
      }
    } else {
      currentChunk = currentChunk
        ? currentChunk + "\n\n" + paragraph
        : paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
