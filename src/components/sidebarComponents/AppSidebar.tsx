import { NavUser } from "./NavUser";
import { ChatHistoryContent } from "./ChatHistoryContent";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "../ui/sidebar";
import { useKnowledgeDocuments } from "@/hooks/useKnowledgeDocuments";
import { useContext } from "react";
import { AuthContext } from "@/auth/AuthContext";

interface AppSidebarProps
  extends React.ComponentPropsWithoutRef<typeof Sidebar> {} 

export function AppSidebar({ ...props }: AppSidebarProps) {
    const { user, isLoading: authLoading } = useContext(AuthContext);
    const { documents, isLoading } = useKnowledgeDocuments(user?.id);
    if (authLoading || isLoading) {
    return <p className="text-slate-500">Loading...</p>;
  }

    return (
    <Sidebar {...props}>
      <SidebarContent className="flex flex-col">
        <SidebarHeader className="flex items-center justify-center bg-sidebar text-sidebar-foreground max-h-full">
          <h1 className="flex justify-start ml-6 pt-4 items-center w-full text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition-all">
            TalkToDoc AI
          </h1>
        </SidebarHeader>
        <SidebarGroup className="flex-1 overflow-y-auto">
          <ChatHistoryContent documents={documents}/>
        </SidebarGroup>
        </SidebarContent> 
        <SidebarFooter className="flex h-16 items-end justify-center bg-sidebar text-sidebar-foreground">
          <NavUser />
        </SidebarFooter>
    </Sidebar>
    )
}