import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../auth/AuthContext'

export const Route = createFileRoute('/login')({
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
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-slate-100">
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#3b82f6',
                brandAccent: '#2563eb',
              }
            }
          }
        }}
        providers={['google']}
        redirectTo={window.location.origin}
      />
    </div>
  )
}
