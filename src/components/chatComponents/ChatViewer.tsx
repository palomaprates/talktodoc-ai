import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { askFile } from "@/services/askFile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaRobot, FaUser, FaPaperPlane, FaSpinner } from "react-icons/fa";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatViewerProps {
  chatId: string;
  fileId: string;
  onBack: () => void;
}

export function ChatViewer({ chatId, fileId, onBack }: ChatViewerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function fetchMessages() {
      setIsFetching(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else if (data) {
        setMessages(data as Message[]);
      }
      setIsFetching(false);
    }

    fetchMessages();
  }, [chatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // 1. Save user message to DB
      const { data: userData, error: userError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          role: "user",
          content: currentInput,
        })
        .select()
        .single();

      if (userError) throw userError;
      setMessages((prev) => [...prev, userData as Message]);

      // 2. Call Edge Function
      const answer = await askFile(fileId, currentInput);

      // 3. Save assistant message to DB
      const { data: aiData, error: aiError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          role: "assistant",
          content: answer,
        })
        .select()
        .single();

      if (aiError) throw aiError;
      setMessages((prev) => [...prev, aiData as Message]);
    } catch (error) {
      console.error("Error in chat flow:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-4xl mx-auto gap-4">
      <div className="flex items-center justify-between w-full px-2">
        <Button variant="ghost" onClick={onBack} className="text-slate-600 hover:text-slate-900">
          ← Voltar para Upload
        </Button>
        <div className="text-sm text-slate-400 font-mono">{fileId.split('-')[0]}</div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col bg-white border-violet-100 shadow-xl rounded-2xl">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          {isFetching ? (
            <div className="flex items-center justify-center h-full text-violet-300">
              <FaSpinner className="animate-spin text-3xl" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
              <FaRobot className="text-4xl opacity-20" />
              <p>Pergunte qualquer coisa sobre este documento!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] items-start gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      msg.role === "user"
                        ? "bg-violet-100 text-violet-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {msg.role === "user" ? <FaUser size={14} /> : <FaRobot size={14} />}
                  </div>
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-none"
                        : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida sobre o arquivo..."
              className="w-full bg-white border border-slate-200 rounded-full py-3 px-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-inner"
              disabled={isLoading || isFetching}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isFetching}
              className="absolute right-2 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-30 disabled:hover:bg-violet-600 transition-colors shadow-md"
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Essa resposta é gerada por IA e baseada exclusivamente no seu documento.
          </p>
        </div>
      </Card>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
