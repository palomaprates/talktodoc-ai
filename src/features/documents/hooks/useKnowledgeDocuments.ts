import type { ChatWithEntities } from "@/types";
import { useEffect, useState } from "react";
import { getDocumentsByUser } from "../api";

export function useKnowledgeDocuments(userId: string | undefined) {
  const [chats, setChats] = useState<ChatWithEntities[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchChats() {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await getDocumentsByUser(userId);
      setChats(data);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchChats();
  }, [userId]);

  return {
    documents: chats,
    isLoading,
    refetch: fetchChats,
  };
}
