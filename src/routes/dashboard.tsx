import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppSidebar } from '@/components/sidebarComponents/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Dropzone } from '@/components/dropzoneComponents/Dropzone'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    const { user, isLoading } = context.auth

    if (isLoading) return

    if (!user) {
      throw redirect({ to: '/login' })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  return (
<SidebarProvider>
<div className="min-w-screen px-4 md:px-8 flex gap-8 bg-violet-50 min-h-screen">
  <div className="w-64 flex flex-col">
    <AppSidebar />
  </div>
  <div className="flex-1 flex justify-around flex-col items-center">
    <Dropzone />
  </div>
</div>
</SidebarProvider>
  )
}