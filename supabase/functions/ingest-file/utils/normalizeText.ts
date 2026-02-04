export function normalizeText(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // deno-lint-ignore no-control-regex
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "");

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
