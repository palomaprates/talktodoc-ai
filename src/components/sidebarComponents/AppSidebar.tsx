import { NavUser } from "./NavUser";
import { ChatHistoryContent } from "./ChatHistoryContent";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "../ui/sidebar";
import type { ChatWithEntities } from "@/types";

interface AppSidebarProps
  extends React.ComponentPropsWithoutRef<typeof Sidebar> {} 

export function AppSidebar({ 
  documents, 
  onDelete,
  onSelectChat,
  activeChatId,
  ...props 
}: AppSidebarProps & { 
  documents: ChatWithEntities[]; 
  onDelete: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
  activeChatId?: string;
}) {
    return (
    <Sidebar {...props}>
      <SidebarContent className="flex flex-col">
        <SidebarHeader className="flex items-center justify-center bg-sidebar text-sidebar-foreground max-h-full">
          <h1 className="flex justify-start ml-6 pt-4 items-center w-full text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-all">
            TalkToDoc AI
          </h1>
        </SidebarHeader>
        <ChatHistoryContent 
          documents={documents} 
          onDelete={onDelete}
          onSelectChat={onSelectChat}
          activeChatId={activeChatId}
        />
        </SidebarContent> 
        <SidebarFooter className="flex h-16 items-end justify-center bg-sidebar text-sidebar-foreground">
          <NavUser />
        </SidebarFooter>
    </Sidebar>
    )
}