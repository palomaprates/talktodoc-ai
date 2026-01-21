import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { User } from '@supabase/supabase-js';

export type RouterContext = {
    auth: {
        user: User | null;
        isLoading: boolean;
    }
}
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <Outlet /> 
  )
}
