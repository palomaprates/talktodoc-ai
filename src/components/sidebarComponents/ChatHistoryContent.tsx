import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import ChatHistoryItem from "./ChatHistoryItem";
import type { ChatWithEntities } from "@/types";

export function ChatHistoryContent({
  documents,
  onDelete,
  onSelectChat,
  activeChatId,
}: {
  documents: ChatWithEntities[];
  onDelete: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
  activeChatId?: string;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden p-4 space-y-3">
      <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-[0.16em] px-1">
        Seus Documentos
      </SidebarGroupLabel>
      <SidebarMenu className="flex flex-col gap-2">
        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-center">
            <p className="text-sm font-medium text-slate-500">
              Nenhum documento ainda.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Faça upload na área ao lado para começar.
            </p>
          </div>
        ) : (
          documents.map((document) => (
            <ChatHistoryItem
              key={document.id}
              document={document}
              onDelete={onDelete}
              onSelectChat={onSelectChat}
              isActive={activeChatId === document.id}
            />
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
