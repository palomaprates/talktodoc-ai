import { supabase } from "@/lib/supabase";

export async function summarizeText(content: string): Promise<string> {
    if (!content) return "";

    const { data, error } = await supabase.functions.invoke("talktodoc-ai", {
        body: {
            action: "summarize",
            content: content,
        },
    });

    if (error) {
        console.error("Summarization error:", error);
        return "Erro ao gerar resumo.";
    }

    return data.summary || "";
}
