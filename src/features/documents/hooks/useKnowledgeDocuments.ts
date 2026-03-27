import type { ChatWithEntities } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { getDocumentsByUser } from "../api";

export function useKnowledgeDocuments(userId: string | undefined) {
  const [chats, setChats] = useState<ChatWithEntities[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchChats = useCallback(async () => {
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
  }, [userId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const updateDocumentTitle = useCallback((chatId: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)),
    );
  }, []);

  return {
    documents: chats,
    isLoading,
    refetch: fetchChats,
    updateDocumentTitle,
  };
}
