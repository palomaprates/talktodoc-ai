import { createFileRoute, redirect } from '@tanstack/react-router'
import { Dropzone } from '../components/Dropzone'
import { AppSidebar } from '@/components/sidebarComponents/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

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
<div className="w-full px-4 md:px-8 h-[calc(100vh-56px)] flex gap-8 overflow-y-hidden">
  <div className="w-64 h-full flex flex-col">
    <AppSidebar />
  </div>
  <div className="flex-1 flex justify-around flex-col items-center">
      <div className="w-full h-full flex flex-col justify-center items-center">
    <section className="w-full min-h-[400px] flex flex-col justify-center items-center bg-gradient-to-r from-blue-300 to-purple-300
 p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md hover:scale-105 transition-all">
      <div className="mb-8">
        <h1 className="text-slate-800 text-2xl font-sans font-extrabold">
          Choose documents to start the AI chat
        </h1>
      </div>
      <Dropzone />
    </section>
  </div>
  </div>
</div>
</SidebarProvider>
  )
}