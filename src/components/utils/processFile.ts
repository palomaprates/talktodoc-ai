import { normalizeText } from "./normalizeText";
import { chunkText } from "./chunkText";
import { supabase } from "@/lib/supabase";
import type { UploadedTextFile } from "@/types";

export async function processFile(file: File): Promise<UploadedTextFile> {
    if (file.type === "application/pdf") {
        return processPdfFile(file);
    } else {
        return processTextFile(file);
    }
}

async function processTextFile(file: File): Promise<UploadedTextFile> {
    const text = await file.text();
    const cleanText = normalizeText(text);
    const chunks = chunkText(cleanText);

    return {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        content: cleanText,
        chunks,
    };
}

async function processPdfFile(file: File): Promise<UploadedTextFile> {
    const reader = new FileReader();
    const fileBase64 = await new Promise<string>((resolve) => {
        reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
        };
        reader.readAsDataURL(file);
    });

    const { data, error } = await supabase.functions.invoke("talktodoc-ai", {
        body: {
            fileBase64,
            filename: file.name,
            mimeType: file.type,
        },
    });

    if (error) {
        console.error("Error processing PDF:", error);
        throw error;
    }

    const cleanText = normalizeText(data.content);
    const chunks = chunkText(cleanText);

    return {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        content: cleanText,
        chunks,
    };
}
