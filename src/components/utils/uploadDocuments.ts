import { supabase } from "@/lib/supabase";
import type { UploadedTextFile } from "@/types";
export async function uploadDocuments(
    files: UploadedTextFile[],
    userId: string,
) {
    if (!files.length) return [];

    for (const file of files) {
        const { data: chat, error: chatError } = await supabase
            .from("chats")
            .insert({
                user_id: userId,
                title: file.name,
            })
            .select()
            .single();

        if (chatError) {
            console.error("Error creating chat:", chatError);
            throw chatError;
        }

        const chatId = chat.id;

        const { data: fileEntity, error: fileError } = await supabase
            .from("files")
            .insert({
                chat_id: chatId,
                original_name: file.name,
                file_type: file.mimeType,
                raw_content: file.content,
                clean_content: file.content,
            })
            .select()
            .single();

        if (fileError) {
            console.error("Error creating file record:", fileError);
            throw fileError;
        }

        const fileId = fileEntity.id;

        if (file.chunks && file.chunks.length > 0) {
            const chunksToInsert = file.chunks.map((content, index) => ({
                file_id: fileId,
                chat_id: chatId,
                content: content,
                chunk_index: index,
                embedding: null, // Embeddings would be generated server-side or via another tool
            }));

            const { error: chunkError } = await supabase
                .from("chunks")
                .insert(chunksToInsert);

            if (chunkError) {
                console.warn("Error inserting chunks:", chunkError);
            }
        }

        if (file.summary) {
            const { error: summaryError } = await supabase
                .from("summaries")
                .insert({
                    chat_id: chatId,
                    content_md: file.summary,
                });

            if (summaryError) {
                console.warn("Error inserting summary:", summaryError);
            }
        }
    }
}
