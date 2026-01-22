import { NavUser } from "./NavUser";
import { Sidebar, SidebarContent, SidebarFooter } from "./ui/sidebar";

interface AppSidebarProps
  extends React.ComponentPropsWithoutRef<typeof Sidebar> {} 

export function AppSidebar({ ...props }: AppSidebarProps) {
    return (
    <Sidebar {...props}>
      <SidebarContent>
        </SidebarContent> 
        <SidebarFooter className="flex h-16 items-end justify-center bg-sidebar text-sidebar-foreground">
          <NavUser />
        </SidebarFooter>
    </Sidebar>
    )
}