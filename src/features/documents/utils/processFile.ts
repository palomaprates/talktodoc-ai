import type { UploadedTextFile } from "@/types";

export async function processFile(file: File): Promise<UploadedTextFile> {
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve) => {
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.split(",")[1];
      resolve(b64 ?? "");
    };
    reader.readAsDataURL(file);
  });

  return {
    name: file.name,
    size: file.size,
    mimeType:
      file.type ||
      (file.name.endsWith(".pdf") ? "application/pdf" : "text/plain"),
    content: base64,
  };
}
