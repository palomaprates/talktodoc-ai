import { supabase } from "@/lib/supabase";

export async function askFile(fileId: string, question: string) {
  const { data, error } = await supabase.functions.invoke("ask-file", {
    body: { file_id: fileId, question },
  });

  if (error) {
    console.error("Error calling ask-file function:", error);
    throw error;
  }

  return data.answer as string;
}
