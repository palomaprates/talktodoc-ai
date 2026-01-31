import { supabase } from "@/lib/supabase";
import type { KnowledgeDocument } from "@/types";
import { useEffect, useState } from "react";

export function useKnowledgeDocuments(userId: string | undefined) {
    const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchDocuments() {
        if (!userId) return;
        const { data, error } = await supabase.from("documents").select("*")
            .eq("user_id", userId).order("created_at", {
                ascending: false,
            });
        if (!error && data) {
            setDocuments(data);
        }
        setIsLoading(false);
    }
    useEffect(() => {
        fetchDocuments();
    }, [userId]);
    return { documents, isLoading, refetch: fetchDocuments };
}
