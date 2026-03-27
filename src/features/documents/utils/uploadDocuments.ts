import { supabase } from "@/lib/supabase";
import type { UploadedTextFile } from "@/types";

type UploadResult = {
  chat_id: string;
  file_ids: string[];
  chunks_count: number;
};

export async function uploadDocuments(
  files: UploadedTextFile[],
): Promise<UploadResult> {
  
  if (!files.length) {
    throw new Error("No files to upload");
  }

  const payload = {
    files: files.map((file) => ({
      fileName: file.name,
      fileType: file.mimeType,
      content: file.content,
    })),
  };

  const { data, error } = await supabase.functions.invoke("ingest-file", {
    body: payload,
  });

  if (error) {
    console.error("Error ingesting files:", error);
    throw error;
  }

  return data as UploadResult;
}
