import { supabase } from "@/lib/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

type TokenHandler = (token: string) => void;

export async function askFile(
  chatId: string,
  question: string,
  fileId?: string,
  onToken?: TokenHandler,
): Promise<string> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing");
  }

  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  const response = await fetch(`${supabaseUrl}/functions/v1/ask-file`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
      Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
    body: JSON.stringify({ chat_id: chatId, file_id: fileId, question }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ask-file failed: ${errorText}`);
  }

  if (!response.body) {
    const data = await response.json();
    return data.answer as string;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const line = event.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const data = line.replace(/^data:\s?/, "");
      if (data === "[DONE]") {
        return fullText;
      }

      try {
        const parsed = JSON.parse(data) as { token?: string; error?: string };
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (parsed.token) {
          fullText += parsed.token;
          onToken?.(parsed.token);
        }
      } catch (err) {
        console.error("Failed to parse SSE chunk:", err);
      }
    }
  }

  return fullText;
}
