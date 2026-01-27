import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import ChatHistoryItem from "./ChatHistoryItem";


export function ChatHistoryContent() {

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden min-h-full">
      <div className="flex justify-between items-center">
        <SidebarGroupLabel className="flex justify-center items-center text-md text-gray-800">
          Your Chats
        </SidebarGroupLabel>
      </div>
      <SidebarMenu>
        {/* implementar um loop aqui para mostrar o histórico */}
        <ChatHistoryItem />
      </SidebarMenu>
    </SidebarGroup>
  );
}
