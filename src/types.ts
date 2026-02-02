import type { Session, User } from "@supabase/supabase-js";

export type UploadedTextFile = {
    name: string;
    size: number;
    mimeType: string;
    content: string;
    summary?: string;
    chunks?: string[];
};

export type Chat = {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
};

export type ChatWithEntities = Chat & {
    files: FileEntity[];
    summaries: Summary[];
};

export type FileEntity = {
    id: string;
    chat_id: string;
    original_name: string;
    file_type: string;
    raw_content: string;
    clean_content: string;
    created_at: string;
};

export type Chunk = {
    id: string;
    file_id: string;
    chat_id: string;
    content: string;
    embedding: number[] | null;
    chunk_index: number;
    created_at: string;
};

export type Summary = {
    id: string;
    chat_id: string;
    content_md: string;
    created_at: string;
};

export type Message = {
    id: string;
    chat_id: string;
    role: "user" | "assistant";
    content: string;
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
