import { supabase } from "@/lib/supabase";

export async function deleteDocument(chatId: string) {
  if (!chatId) return;

  try {
    await Promise.all([
      supabase.from("chunks").delete().eq("chat_id", chatId),
      supabase.from("messages").delete().eq("chat_id", chatId),
      supabase.from("files").delete().eq("chat_id", chatId),
    ]);
  } catch (err) {
    console.warn("Secondary cleanup notice:", err);
  }

  const { error } = await supabase.from("chats").delete().eq("id", chatId);

  if (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}
