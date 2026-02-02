import { supabase } from "@/lib/supabase";
import type { UploadedTextFile } from "@/types";
import { normalizeText } from "./normalizeText";
import { summarizeText } from "./summarizeText";
import { chunkText } from "./chunkText";

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            resolve(base64);
        };

        reader.onerror = () => reject(reader.error);

        reader.readAsDataURL(file);
    });
}

async function processTextFile(file: File): Promise<UploadedTextFile> {
    const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });

    const normalizedContent = normalizeText(text);
    const summary = await summarizeText(normalizedContent);
    const chunks = chunkText(normalizedContent);

    return {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        content: normalizedContent,
        summary,
        chunks,
    };
}

async function processPdfFile(file: File): Promise<UploadedTextFile> {
    const base64 = await fileToBase64(file);

    const { data, error } = await supabase.functions.invoke("talktodoc-ai", {
        body: {
            fileBase64: base64,
            filename: file.name,
            mimeType: file.type,
        },
    });

    if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Failed to convert PDF: ${error.message}`);
    }

    const normalizedContent = normalizeText(data.content);
    const summary = await summarizeText(normalizedContent);
    const chunks = chunkText(normalizedContent);

    return {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        content: normalizedContent,
        summary,
        chunks,
    };
}
export async function processFile(file: File): Promise<UploadedTextFile> {
    if (file.type === "text/plain" || file.type === "text/markdown") {
        return processTextFile(file);
    }
    if (file.type === "application/pdf") {
        return processPdfFile(file);
    }
    throw new Error(`Unsupported file type: ${file.type}`);
}
