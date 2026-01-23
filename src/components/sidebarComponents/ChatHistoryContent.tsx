import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { AiOutlinePlusSquare } from "react-icons/ai";
import ChatHistoryItem from "./ChatHistoryItem";


export function ChatHistoryContent() {

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden min-h-full">
      <div className="flex justify-between items-center">
        <SidebarGroupLabel className="flex justify-center items-center text-md text-gray-800">
          Chats
        </SidebarGroupLabel>
        <SidebarGroupLabel
          className="flex items-center justify-center w-1/2 space-x-1 p-1 rounded-lg bg-sidebar-foreground/80 hover:bg-sidebar-foreground/90 text-white transition cursor-pointer"
        >
            <AiOutlinePlusSquare />
             <span>New chat</span>
        </SidebarGroupLabel>
      </div>
      <SidebarMenu>
        {/* implementar um loop aqui para mostrar o histórico */}
        <ChatHistoryItem />
      </SidebarMenu>
    </SidebarGroup>
  );
}
