import type { UploadedTextFile } from "../dropzoneComponents/Dropzone";

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
function processTextFile(file: File): Promise<UploadedTextFile> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve({
                name: file.name,
                size: file.size,
                mimeType: file.type,
                content: reader.result as string,
            });
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
async function processPdfFile(file: File): Promise<UploadedTextFile> {
    const base64 = await fileToBase64(file);
    const res = await fetch("/functions/v1/talktodoc-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fileBase64: base64,
            filename: file.name,
            mimeType: file.type,
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to convert PDF");
    }

    const data = await res.json();
    return {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        content: data.content, // mock
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
