import { useRef, useState } from "react";
import {
  SidebarMenuButton,
  SidebarMenuItem,
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
import type { ChatWithEntities } from "@/types";

export default function ChatHistoryItem({
  document,
  onDelete,
}: {
  document: ChatWithEntities;
  onDelete: (chatId: string) => void;
}) {
  const firstFile = document.files?.[0];
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <SidebarMenuItem>
      <div className="relative group w-full px-1">
        <SidebarMenuButton asChild className="w-full h-auto p-0 hover:bg-transparent">
          <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-md flex flex-col gap-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <span
                  ref={spanRef}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onMouseDown={(e) => e.stopPropagation()}
                  tabIndex={isEditing ? 0 : -1}
                  className={`block text-sm font-semibold text-slate-800 break-words ${
                    isEditing
                      ? "border-2 border-violet-400 bg-violet-50 rounded px-1 outline-none"
                      : ""
                  }`}
                >
                  {document.title}
                </span>

                <div className="flex items-center gap-1.5 mt-1">
                  {firstFile && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                      {firstFile.file_type}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium">
                    • {new Date(document.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="size-4" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-40"
                  side="right"
                  align="start"
                  sideOffset={8}
                >
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer focus:bg-violet-50 focus:text-violet-600"
                    onClick={() => {
                      setIsEditing(true);
                      setTimeout(() => {
                        spanRef.current?.focus();
                        const range = window.document.createRange();
                        const selection = window.getSelection();
                        if (spanRef.current && selection) {
                           range.selectNodeContents(spanRef.current);
                           range.collapse(false);
                           selection.removeAllRanges();
                           selection.addRange(range);
                        }
                      }, 50);
                    }}
                  >
                    <TbPencil className="size-3.5" />
                    <span className="text-xs font-medium">Renomear</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={(e) => {e.stopPropagation(); onDelete(document.id)}} className="flex items-center gap-2 cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600">
                    <Trash2 className="size-3.5" />
                    <span className="text-xs font-medium">Excluir</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {firstFile?.clean_content || "Nenhum arquivo processado"}
            </p>
          </div>
        </SidebarMenuButton>
      </div>
    </SidebarMenuItem>
  );
}
