import { createFileRoute, redirect } from '@tanstack/react-router'
import { Dropzone } from '../components/Dropzone'
import { AppSidebar } from '@/components/AppSidebar'
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
<div className="max-w-6xl mx-auto h-[calc(100vh-56px)] flex gap-8 overflow-hidden">
  <div className="w-64 h-full flex flex-col">
    <AppSidebar />
  </div>
  <div className="flex-1 flex justify-around flex-col items-center">
    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          TalkToDoc AI
      </h1>
      <div className="w-full h-full flex flex-col justify-center items-center">
    <section className="w-full max-h-[400px] flex flex-col justify-center items-center bg-gradient-to-r from-blue-100 to-purple-100 p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md">
      <div className="mb-8">
        <h1 className="text-slate-800 text-2xl">
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