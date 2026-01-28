import { supabase } from "@/lib/supabase";
import type { KnowledgeDocument } from "@/types";
import { useEffect, useState } from "react";

export function useKnowledgeDocuments(userId: string | undefined) {
    const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        async function fetchDocuments() {
            const { data, error } = await supabase.from("documents").select("*")
                .eq("user_id", userId).order("created_at", {
                    ascending: false,
                });
            if (!error && data) {
                setDocuments(data);
            }
            setIsLoading(false);
        }
        fetchDocuments();
    }, [userId]);
    return { documents, isLoading };
}
