import { supabase } from "@/lib/supabase";
import type { FileEntity, Summary } from "@/types";
import { useEffect, useState } from "react";

export type FileWithSummary = FileEntity & {
    summaries: Summary[];
};

export function useKnowledgeDocuments(userId: string | undefined) {
    const [files, setFiles] = useState<FileWithSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchFiles() {
        if (!userId) return;
        const { data, error } = await supabase
            .from("files")
            .select(`
                *,
                chats!inner(user_id),
                summaries:summaries(*)
            `)
            .eq("chats.user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching files:", error);
        } else if (data) {
            setFiles(data as unknown as FileWithSummary[]);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchFiles();
    }, [userId]);

    return {
        documents: files,
        isLoading,
        refetch: fetchFiles,
    };
}
