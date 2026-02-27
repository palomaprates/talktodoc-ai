import { useState, useEffect, useRef } from "react";
import { askFile } from "../services/askFile";
import { getMessages, insertMessage } from "../api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaRobot, FaUser, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { toast } from "@/lib/toast";
import type { Message } from "@/types";

const QUICK_PROMPTS = [
  "Faça um resumo deste documento.",
  "Quais são os principais pontos?",
  "Há alguma contradição ou inconsistência?",
];

interface ChatViewerProps {
  chatId: string;
  fileId: string;
  documentTitle?: string;
  onBack: () => void;
}

export function ChatViewer({
  chatId,
  fileId,
  documentTitle,
  onBack,
}: ChatViewerProps) {
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
      try {
        const data = await getMessages(chatId);
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      } finally {
        setIsFetching(false);
      }
    }

    fetchMessages();
  }, [chatId]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const userMsg = await insertMessage(chatId, "user", currentInput);
      setMessages((prev) => [...prev, userMsg]);

      const answer = await askFile(fileId, currentInput);

      const aiMsg = await insertMessage(chatId, "assistant", answer);
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error in chat flow:", error);
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-4xl mx-auto gap-4">
      <div className="flex items-center justify-between w-full px-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-600 hover:text-slate-900"
        >
          ← Voltar para Upload
        </Button>
        <div className="text-sm font-medium text-slate-700 truncate max-w-[240px]" title={documentTitle ?? fileId}>
          {documentTitle ?? fileId.split("-")[0]}
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col bg-white border-violet-100 shadow-xl rounded-2xl">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          {isFetching ? (
            <div className="flex items-center justify-center h-full text-violet-300">
              <FaSpinner className="animate-spin text-3xl" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <FaRobot className="text-4xl opacity-20" />
              <p>Pergunte qualquer coisa sobre este documento!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
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
                    {msg.role === "user" ? (
                      <FaUser size={14} />
                    ) : (
                      <FaRobot size={14} />
                    )}
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
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <form
            onSubmit={handleSend}
            className="relative flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua dúvida…"
              rows={1}
              className="w-full min-h-[44px] max-h-32 resize-y bg-white border border-slate-200 rounded-2xl py-3 px-6 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-inner"
              disabled={isLoading || isFetching}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isFetching}
              className="absolute right-2 bottom-2 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-30 disabled:hover:bg-violet-600 transition-colors shadow-md"
            >
              <FaPaperPlane size={14} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Resposta gerada por IA com base apenas no seu documento.
          </p>
        </div>
      </Card>
    </div>
  );
}
