import { supabase } from "@/lib/supabase";
import type { ChatWithEntities } from "@/types";
import { useEffect, useState } from "react";

export function useKnowledgeDocuments(userId: string | undefined) {
    const [chats, setChats] = useState<ChatWithEntities[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchChats() {
        if (!userId) return;

        const { data, error } = await supabase
            .from("chats")
            .select(`
                id,
                title,
                created_at,
                user_id,
                files (*),
                summaries (*)
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching chats:", error);
        } else if (data) {
            setChats(data as unknown as ChatWithEntities[]);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchChats();
    }, [userId]);

    return {
        documents: chats, // Returned as 'documents' for compatibility with Sidebar
        isLoading,
        refetch: fetchChats,
    };
}
