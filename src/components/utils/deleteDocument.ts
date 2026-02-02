import { supabase } from "@/lib/supabase";

/**
 * Deletes a file and attempts to clean up the associated chat context.
 */
export async function deleteDocument(fileId: string) {
  // 1. Get the chat_id first for cleanup
  const { data: file, error: fetchError } = await supabase
    .from("files")
    .select("chat_id")
    .eq("id", fileId)
    .single();

  if (fetchError) {
    console.error("Error fetching file for deletion:", fetchError);
    // Even if we can't find the chat, we'll try to delete the file
  }

  const chatId = file?.chat_id;

  // 2. Delete the file (this should cascade to chunks if FF is setup, but we'll be safe)
  const { error: fileDeleteError } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId);

  if (fileDeleteError) {
    console.error("Error deleting file:", fileDeleteError);
    throw fileDeleteError;
  }

  // 3. If we have a chatId, delete associated summaries and the chat itself
  if (chatId) {
    // Delete summaries
    await supabase.from("summaries").delete().eq("chat_id", chatId);
    // Delete chunks (sharing same chat_id)
    await supabase.from("chunks").delete().eq("chat_id", chatId);
    // Delete messages
    await supabase.from("messages").delete().eq("chat_id", chatId);
    // Finally delete the chat
    await supabase.from("chats").delete().eq("id", chatId);
  }
}
