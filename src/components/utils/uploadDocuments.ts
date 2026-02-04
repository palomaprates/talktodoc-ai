import { supabase } from "@/lib/supabase";
import type { UploadedTextFile } from "@/types";

export async function uploadDocuments(
    files: UploadedTextFile[],
    _userId: string,
) {
    if (!files.length) return [];

    for (const file of files) {
        console.log(`Uploading and ingesting: ${file.name}`);
        const { data, error } = await supabase.functions.invoke("ingest-file", {
            body: {
                fileName: file.name,
                fileType: file.mimeType,
                content: file.content,
            },
        });

        if (error) {
            console.error(`Error ingesting ${file.name}:`, error);
            throw error;
        }

        console.log(`Ingested ${file.name} successfully:`, data);
    }

    return files;
}
