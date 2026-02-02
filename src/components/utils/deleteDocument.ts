import { supabase } from "@/lib/supabase";

export async function deleteDocument(fileId: string) {
  const { data: file, error: fetchError } = await supabase
    .from("files")
    .select("chat_id")
    .eq("id", fileId)
    .single();

  if (fetchError) {
    console.error("Error fetching file for deletion:", fetchError);
  }

  const chatId = file?.chat_id;
  const { error: fileDeleteError } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId);

  if (fileDeleteError) {
    console.error("Error deleting file:", fileDeleteError);
    throw fileDeleteError;
  }

  if (chatId) {
    await supabase.from("summaries").delete().eq("chat_id", chatId);
    await supabase.from("chunks").delete().eq("chat_id", chatId);
    await supabase.from("messages").delete().eq("chat_id", chatId);
    await supabase.from("chats").delete().eq("id", chatId);
  }
}
