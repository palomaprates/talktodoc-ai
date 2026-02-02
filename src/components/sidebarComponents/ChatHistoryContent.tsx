import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import ChatHistoryItem from "./ChatHistoryItem";
import type { FileWithSummary } from "@/hooks/useKnowledgeDocuments";

export function ChatHistoryContent({ 
  documents, 
  onDelete 
}: { 
  documents: FileWithSummary[]; 
  onDelete: (documentId: string) => void 
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden min-h-full p-4">
      <SidebarGroupLabel className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Your Documents
      </SidebarGroupLabel>
      <SidebarMenu className="gap-3">
        {documents.map((document) => (
          <ChatHistoryItem key={document.id} document={document} onDelete={onDelete} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
