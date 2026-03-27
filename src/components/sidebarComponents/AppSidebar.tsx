import { NavUser } from "./NavUser";
import { ChatHistoryContent } from "./ChatHistoryContent";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "../ui/sidebar";
import type { ChatWithEntities } from "@/types";

type AppSidebarProps = React.ComponentPropsWithoutRef<typeof Sidebar>; 

export function AppSidebar({ 
  documents, 
  onDelete,
  onSelectChat,
  activeChatId,
  onNewChat,
  ...props 
}: AppSidebarProps & { 
  documents: ChatWithEntities[]; 
  onDelete: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
  activeChatId?: string;
  onNewChat: () => void;
}) {
    return (
    <Sidebar {...props}>
      <SidebarContent className="flex flex-col">
        <SidebarHeader className="flex flex-col items-start gap-3 bg-sidebar text-sidebar-foreground px-4 pt-4 pb-3">
          <h1 className="flex items-center w-full text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 cursor-default">
            TalkToDoc AI
          </h1>
          <button
            type="button"
            onClick={onNewChat}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            Novo chat
          </button>
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
