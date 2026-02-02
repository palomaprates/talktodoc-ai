import type { Session, User } from "@supabase/supabase-js";

export type UploadedTextFile = {
    name: string;
    size: number;
    mimeType: string;
    content: string;
    summary?: string;
};

export type KnowledgeDocument = {
    id: string;
    title: string;
    content: string;
    summary: string | null;
    source_type: string;
    original_filename: string | null;
    created_at: string;
};

export type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
};

export type RouterContext = {
    auth: AuthContextType;
};
