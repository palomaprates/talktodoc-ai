import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import ChatHistoryItem from "./ChatHistoryItem";
import type { KnowledgeDocument } from "@/types";


export function ChatHistoryContent({ documents }: { documents: KnowledgeDocument[] }) {

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden min-h-full">
      <div className="flex justify-between items-center">
        <SidebarGroupLabel className="flex justify-center items-center text-md text-gray-800">
          Your Chats
        </SidebarGroupLabel>
      </div>
      <SidebarMenu>
        {documents.map((document) => (
          <ChatHistoryItem key={document.id} document={document} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
