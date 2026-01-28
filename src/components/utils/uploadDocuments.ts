import { supabase } from "@/lib/supabase";
import type { UploadedTextFile } from "@/types";

export async function uploadDocuments(
    files: UploadedTextFile[],
    userId: string,
) {
    if (!files.length) return;

    const documents = files.map((file) => ({
        user_id: userId,
        title: file.name,
        content: file.content,
        source_type: file.mimeType.split(".").pop() ?? "txt",
        original_filename: file.name,
    }));

    const { error } = await supabase
        .from("documents")
        .insert(documents);

    if (error) {
        console.error("Error uploading documents:", error);
        throw error;
    }
}
