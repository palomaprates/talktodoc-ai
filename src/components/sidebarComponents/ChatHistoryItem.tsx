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
  onSelectChat,
  isActive,
}: {
  document: ChatWithEntities;
  onDelete: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
  isActive: boolean;
}) {
  const firstFile = document.files?.[0];
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <SidebarMenuItem>
      <div className="relative group w-full px-1.5 py-0.5">
        <SidebarMenuButton
          asChild
          className="w-full h-auto p-0 hover:bg-transparent cursor-pointer"
        >
          <div
            onClick={() => onSelectChat(document.id)}
            className={`w-full rounded-xl border p-3.5 shadow-sm transition-all duration-200 flex flex-col gap-2 hover:border-violet-300 hover:shadow-md ${
              isActive
                ? "border-violet-400 bg-violet-50/80 ring-2 ring-violet-500/15 shadow-md"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0 justify-start items-start ml-4">
                <span
                  ref={spanRef}
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onMouseDown={(e) => e.stopPropagation()}
                  tabIndex={isEditing ? 0 : -1}
                  className={`block text-lg sm:text-sm font-semibold text-slate-800 break-words truncate ${
                    isEditing
                      ? "border-2 border-violet-400 bg-violet-50 rounded px-1 py-0.5 outline-none"
                      : ""
                  }`}
                >
                  {document.title}
                </span>

                <div className="flex items-center justify-start gap-1.5 mt-1">
                  {firstFile && (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">
                      {firstFile.file_type}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(document.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <button
                  className={`p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                    onClick={(e) => e.stopPropagation()}
                  >
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
                    onClick={(e) => {
                      e.stopPropagation();
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

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(document.id);
                  }}
                  className="flex items-center gap-2 cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600"
                >
                    <Trash2 className="size-3.5" />
                    <span className="text-xs font-medium">Excluir</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {firstFile?.clean_content || "Nenhum arquivo processado"}
            </p>
          </div>
        </SidebarMenuButton>
      </div>
    </SidebarMenuItem>
  );
}
