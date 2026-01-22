import { createFileRoute, redirect } from '@tanstack/react-router'
import { Dropzone } from '../components/Dropzone'
import { NavUser } from '@/components/NavUser'

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
<div className="max-w-6xl mx-auto h-screen flex gap-8">
  <div className="w-64 h-full flex flex-col">
    <div className="mt-auto">
      <NavUser /> {/*posicionar o menu no final da tela depois*/}
    </div>
  </div>
  <div className="flex-1 flex items-center">
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
  )
}