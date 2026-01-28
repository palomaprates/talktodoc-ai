import { useRef, useState } from "react";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { TbPencil } from "react-icons/tb";
import type { KnowledgeDocument } from "@/types";

export default function ChatHistoryItem({ document }: { document: KnowledgeDocument}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const { isMobile } = useSidebar();
  const [isEditing, setIsEditing] = useState(false);
  return (
    <SidebarMenuItem className="mt-6 min-h-full">
      <SidebarMenuButton
        className="flex items-center space-x-1 w-full h-12 hover:bg-sidebar-foreground/20 transition cursor-pointer"
      >
        <span
          contentEditable={isEditing}
          suppressContentEditableWarning
          ref={spanRef}
          onMouseDown={(e) => e.stopPropagation()}
          className={`text-sm font-sans ${isEditing ? "border border-purple-400 rounded px-1" : ""}`}
          tabIndex={isEditing ? 0 : -1}
        >
        </span>
        <span>{document.title}</span>
         <p className="text-xs text-slate-500 mt-1">
        {document.source_type} •{" "}
        {new Date(document.created_at).toLocaleDateString()}
      </p>
        <p className="text-sm text-slate-600 mt-3 line-clamp-3">
        {document.content.slice(0, 150)}
      </p>
     </SidebarMenuButton> 
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="text-gray-600 cursor-pointer">
          <SidebarMenuAction showOnHover>
            <MoreHorizontal />
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48"
          side={isMobile ? "right" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setIsEditing(true);
              setTimeout(() => {
                if (!spanRef.current) return;
                spanRef.current.focus();
                const selection = window.getSelection();
                selection?.removeAllRanges();
              }, 300);
            }}
          >
            <TbPencil className="text-muted-foreground" />{" "}
            <span className="text-muted-foreground text-xs">Renomear</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
          >
            <Trash2 className=" text-red-600" />
            <span className="text-red-600 text-xs">Excluir</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}