import { supabase } from "@/lib/supabase";
import type { Message } from "@/types";

export async function getMessages(chatId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
  return (data ?? []) as Message[];
}

export async function insertMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ chat_id: chatId, role, content })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}
