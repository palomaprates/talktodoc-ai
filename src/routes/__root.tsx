import { createRootRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [session, setSession] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate({ to: '/login' })
  }

  return (
    <>
      <div className="p-4 flex gap-4 bg-slate-900 text-white items-center justify-between">
        <div className="flex gap-4">
          <Link to="/" className="[&.active]:font-bold hover:text-blue-400 transition-colors cursor-pointer">
            Home
          </Link>
          <Link to="/about" className="[&.active]:font-bold hover:text-blue-400 transition-colors cursor-pointer">
            About
          </Link>
        </div>
        <div>
          {session && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">{session.user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <hr className="border-slate-800" />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </>
  )
}
