export type UploadedTextFile = {
    name: string;
    size: number;
    mimeType: string;
    content: string;
};

export type KnowledgeDocument = {
    id: string;
    title: string;
    content: string;
    source_type: string;
    original_filename: string | null;
    created_at: string;
};
