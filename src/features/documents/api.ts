import { supabase } from "@/lib/supabase";
import type { ChatWithEntities } from "@/types";

export async function getDocumentsByUser(
  userId: string,
): Promise<ChatWithEntities[]> {
  const { data, error } = await supabase
    .from("chats")
    .select(
      `
      id,
      title,
      created_at,
      user_id,
      files (*)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
  return (data ?? []) as unknown as ChatWithEntities[];
}
