import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useContext, useEffect } from 'react'
import { AuthContext } from '@/features/auth/AuthContext'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    const { user, isLoading } = context.auth;

    if (isLoading) return;
    if (user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginComponent,
})

function LoginComponent() {
  const { user, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, isLoading, navigate]);

  if (isLoading || user) return null;

  return (
    <div className="p-4 sm:p-8 text-center w-full min-h-[calc(100vh-56px)] flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6 transition-all hover:scale-105">
          TalkToDoc AI
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                },
              },
            },
            className: {
              container: 'text-left',
              label: 'text-slate-700',
              input:
                'rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
              button:
                'w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg shadow-lg transition-transform hover:scale-[1.02] cursor-pointer',
              anchor: 'text-blue-600 hover:underline',
              message: 'text-slate-600',
            },
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  )
}
