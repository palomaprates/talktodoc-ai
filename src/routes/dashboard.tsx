import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { Dropzone } from '../components/Dropzone'

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
  const handleLogout = async () => {
    await supabase.auth.signOut();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          TalkToDoc AI
        </h1>
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLogout}
            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold py-2 px-6 rounded-lg transition-all border border-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="bg-gradient-to-r from-blue-100 to-purple-100 p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md">
          <div className="mb-8">
            <h1 className="text-slate-800 text-2xl">Choose documents to start the AI chat</h1>
          </div>
          <Dropzone />
        </section>
      </div>
    </div>
  )
}