import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "./ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { supabase } from "@/lib/supabase";

export function NavUser() {
    const { user, isLoading } = useContext(AuthContext);
    if (isLoading) return <p>Carregando...</p>;
    if (!user) return <p>Nenhum usuário logado.</p>;
    async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
    }
    return (
      <SidebarProvider>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-gradient-to-r from-purple-100/40 via-purple-100 to-[#e8dbf6]/30-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user?.user_metadata?.avatar_url}
                  alt={user?.user_metadata?.name}
                  />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.user_metadata?.name}
                </span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            // side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user?.user_metadata?.avatar_url}
                    alt="avatar"
                    />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.user_metadata?.name}
                  </span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
    </SidebarProvider>

    )
}
