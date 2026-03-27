export function normalizeText(text: string): string {
  if (!text) return "";

  let cleaned = text;

  cleaned = Array.from(cleaned)
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      if (code === 9 || code === 10 || code === 13) return true;
      if (code < 32) return false;
      if (code >= 127 && code <= 159) return false;
      return true;
    })
    .join("");

  cleaned = cleaned.replace(/[ \t]+/g, " ");

  cleaned = cleaned.replace(/\r\n/g, "\n");

  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  const lines = cleaned.split("\n");
  const dedupedLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 || lines[i] !== lines[i - 1] || lines[i] === "") {
      dedupedLines.push(lines[i]);
    }
  }
  cleaned = dedupedLines.join("\n");

  return cleaned.trim();
}
